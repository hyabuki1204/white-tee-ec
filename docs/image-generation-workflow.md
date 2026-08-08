# WHITE TEE 画像生成ワークフロー 設計書

Claude API を「クリエイティブディレクター」、Midjourney 系 API を「レンダリングエンジン」として使い、
Instagram ティザー / EC ヒーロー / 商品 LP 用ビジュアルを **人間承認前提の半自動** で生成するための設計。

**このドキュメントは設計のみ。実装コードは含まない。**

- 対象リポジトリ: `white-tee-ec` (Next.js 16.2.9 / React 19 / Supabase / Stripe)。**public リポジトリ**
- 前提: 初期実装では画像生成 API 呼び出しはモック
- 前提: API キーはサーバー側のみ。`NEXT_PUBLIC_` 接頭辞は一切使わない

**決定済みの方針**

| 論点 | 決定 |
|---|---|
| **実運用に出す画像** | Instagram 投稿画像と EC ブランディングの **景色・雰囲気の画像**。商品そのもの・生地の描写は**公開前テスト専用**（第 2.1 / 7.7 節） |
| **自動化の範囲** | `internal_test` はエージェントが全自動で回す。`production` の画像承認は**人間のみ、例外なし**（第 7.8 節） |
| **スケジューラ** | webhook が主、**GitHub Actions** が安全網、テスト中はスクリプト。Vercel は Hobby のまま（第 10 章） |

---

## 0. 設計原則

既存コードベースの流儀に合わせる。新しい流儀を持ち込まない。

| 原則 | 具体 |
|---|---|
| **サーバー専用境界を守る** | `lib/supabase/admin.ts` の `createSupabaseAdminClient()` は service role。`import "server-only"` を付けたモジュールからのみ呼ぶ（`lib/admin/auth.ts` と同じ） |
| **mock / supabase フォールバック** | `lib/supabase/env.ts` の `getDataSource()` と同じ思想で `getImageProvider()` を作る。env 未設定なら自動で mock |
| **リポジトリ層で DB を隠す** | `lib/db/products/` と同型で `lib/db/images/` を作る（`repository.ts` / `admin-repository.ts` / `mapper.ts`） |
| **管理 API は `/api/admin/` 配下** | `middleware.ts` の matcher が `/api/admin/:path*` を既にカバー。加えて各ルートで `requireAdminSession()` を呼ぶ（多層防御。既存ルートも両方やっている） |
| **外部からの入口は署名検証** | `/api/webhooks/*` は middleware の対象外。Stripe webhook と同じく署名必須 |
| **内部起動は Bearer シークレット** | `app/api/internal/apply-pricing/route.ts` の `MIGRATION_SECRET` パターンを踏襲 |
| **マイグレーションは SQL ファイル** | `supabase/migrations/*.sql` に追加。`scripts/run-migrations.mjs` が `DATABASE_URL` 経由で流す |
| **承認されるまで公開しない** | 未承認画像は非公開バケット + 短命 signed URL。公開バケットには置かない |
| **用途の線引きを型で持つ** | 「景色・雰囲気」は実運用に出す。「商品・生地の描写」はテスト専用。運用ルールではなく enum + CHECK 制約で強制する（第 2.1 節） |
| **リポジトリは public** | スキーマもルート名も公開される前提。防御を秘匿性に依存させない（HMAC / Bearer のみ） |

> ⚠️ `AGENTS.md` は「実装前に `node_modules/next/dist/docs/` の該当ガイドを読むこと」を要求している。
> 本設計時点では `node_modules` が未インストールで参照できなかった。
> **実装フェーズの最初に必ず参照し、Route Handler / Cron / `params` の規約を確認すること。**
> 本書のルートハンドラ例は既存コード（`app/api/admin/orders/[id]/status/route.ts` の
> `params: Promise<{ id: string }>` 形式）に合わせてある。

---

## 1. 全体アーキテクチャ

### 1.1 3 つの役割

```
        ┌──────────────────────────────────────────────────────┐
        │  Director  = Claude API                              │
        │  何を撮るか決める。ブランド適合を判断する。          │
        └──────────────────────────────────────────────────────┘
                              ↓ 構造化プロンプト
        ┌──────────────────────────────────────────────────────┐
        │  Renderer  = 画像生成プロバイダ (MJ 系 / Flux / mock) │
        │  絵にするだけ。差し替え可能な部品として扱う。        │
        └──────────────────────────────────────────────────────┘
                              ↓ 画像
        ┌──────────────────────────────────────────────────────┐
        │  Curator   = 人間 (管理画面)                         │
        │  公開判断は必ずここ。自動公開は設計上存在しない。    │
        └──────────────────────────────────────────────────────┘
```

### 1.2 コンポーネント図

```
┌─────────────────────────────────────────────────────────────────────┐
│ ブラウザ (管理者のみ)                                               │
│  /admin/images/briefs   /admin/images/[id]   /admin/images/review    │
│  → API キーは一切持たない。fetch するのは同一オリジンの Route のみ  │
└───────────────────────────┬─────────────────────────────────────────┘
                            │ Cookie: admin session (既存の仕組み)
                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Next.js Route Handlers (Vercel / Node ランタイム)                    │
│                                                                     │
│  /api/admin/images/**      管理操作。middleware で認証済み           │
│  /api/internal/images/tick 定期実行。Bearer IMAGE_WORKER_SECRET      │
│  /api/webhooks/images/[provider]  プロバイダ完了通知。HMAC 検証      │
│                                                                     │
│  ┌───────────────┐  ┌────────────────┐  ┌───────────────────────┐   │
│  │ lib/images/   │  │ lib/images/     │  │ lib/db/images/        │   │
│  │  director/    │  │  providers/     │  │  repository.ts        │   │
│  │  (Claude)     │  │  (抽象 + 実装)  │  │  admin-repository.ts  │   │
│  └───────┬───────┘  └────────┬────────┘  └──────────┬────────────┘   │
└──────────┼───────────────────┼──────────────────────┼────────────────┘
           │                   │                      │
           ▼                   ▼                      ▼
   ┌──────────────┐   ┌──────────────────┐   ┌──────────────────────┐
   │ Anthropic    │   │ 画像生成プロバイダ │   │ Supabase              │
   │ Messages API │   │ (第三者 / 要リスク │   │  Postgres (ジョブ状態)│
   │              │   │  管理)            │   │  Storage (2 バケット) │
   └──────────────┘   └──────────────────┘   └──────────────────────┘
```

### 1.3 データフロー（正常系）

```
[人間] ブリーフ作成
   │   例: 「新作 Compact Cotton Tee の IG ティザー、5 枚、9月頭公開」
   ▼
[Claude Stage 1] ブリーフ → コンセプト案 N 件（構図・光・世界観）
   │
   ▼
[人間] コンセプトを選ぶ / 文言を直す ← ★承認ゲート 1（安い段階で捨てる）
   │
   ▼
[Claude Stage 2] コンセプト → プロバイダ非依存の中間表現（RenderSpec）
   │
   ▼
[アダプタ] RenderSpec → プロバイダ固有のプロンプト文字列 + パラメータ
   │
   ▼
[ジョブキュー] image_generation_jobs に queued で INSERT（ここで HTTP は返す）
   │
   ▼
[ワーカー] cron tick が submit → poll、または webhook で完了受信
   │
   ▼
[取り込み] 画像を即 Supabase Storage の **非公開** バケットへ再ホスト
   │        （プロバイダの CDN URL は期限切れする前提）
   ▼
[Claude Stage 3] 生成画像を vision で評価（ブランド適合 / 破綻 / alt text 案）
   │              ※ あくまで人間の判断材料。自動承認には使わない
   ▼
[人間] レビュー画面で 承認 / 却下 / 再指示 ← ★承認ゲート 2（必須）
   │
   ├─ 却下 → 理由を記録して終了（Claude への学習材料として保存）
   ├─ 再指示 → 指摘を Stage 1 にフィードバックして revision を作る（ループ）
   └─ 承認 → release_policy = production のときだけ公開バケットへコピーして
              image_assets を作成（internal_test はここで止まる）
                 │
                 ▼
        [人間] さらに別操作で product_images / site_content に紐付け
               （承認 ≠ 公開。2 段階に分ける）
```

### 1.4 なぜ「リクエスト内で待たない」のか

Midjourney 系は 1 枚あたり **30 秒〜数分**、混雑時はさらに伸びる。
Vercel の Function 実行時間上限内に収まらないことがあり、収まっても管理画面が固まる。

したがって **HTTP リクエストは必ずジョブを DB に積むだけで返す**。
生成の進行は次の 2 経路で進める。

1. **Webhook（優先）** — プロバイダが対応していれば最短・最安
2. **ポーリング（フォールバック）** — cron tick が `submitted` / `running` のジョブを突く

> **スケジューラの結論（第 10 章）**: Vercel Cron は使わない（Hobby は頻度が足りず、
> これだけのために Pro に上げる理由がない）。**webhook を主経路**とし、
> 取りこぼしと stuck job の回収を **GitHub Actions（10 分間隔）** に任せる。
> 開発・テスト中はスケジューラなしで `npm run images:drain` を叩けばよい。

---

## 2. DB テーブル案

`supabase/migrations/add-image-generation.sql` として追加する想定。
既存の `set_updated_at()` トリガ関数をそのまま再利用する。

### 2.1 Enum

```sql
create type public.image_purpose as enum (
  'instagram_teaser',   -- 4:5 / 1:1、上下に余白（テキスト載せ想定）
  'ec_hero',            -- 16:9 / 3:2、商品が主役
  'product_lp',         -- 3:4 縦、ディテール寄り
  'journal',            -- ジャーナル記事のアイキャッチ
  'fabric'              -- 生地紹介ページ用
);

-- 何を写すか。実運用に出せるかどうかはこれで決まる
create type public.image_subject_class as enum (
  'scenery_mood',      -- 景色・光・空気・静物。商品が主題ではない
  'styling_scene',     -- 着用シーン。商品は写り込むが主題は空気感
  'product_depiction', -- 商品そのものを写す
  'fabric_macro'       -- 生地の質感マクロ
);

create type public.image_release_policy as enum (
  'production',    -- 承認後、公開バケットへ出せる
  'internal_test'  -- 承認はできるが公開バケットへ出せない（検証専用）
);

create type public.image_job_status as enum (
  'queued',       -- 積まれた（or リトライ待ち。next_attempt_at 参照）
  'submitting',   -- ワーカーがリース取得して送信中
  'submitted',    -- プロバイダ受理。provider_job_id あり
  'running',      -- 生成中
  'succeeded',    -- 画像 URL が揃った（まだ Storage 未取り込み）
  'downloading',  -- Storage へ取り込み中
  'stored',       -- 取り込み完了 = レビュー待ちが発生した状態（終端）
  'failed',       -- 恒久的失敗（終端）
  'cancelled',    -- 人間が中止（終端）
  'expired'       -- 生存時間超過を reaper が回収（終端）
);

create type public.image_review_state as enum (
  'pending_review',
  'approved',
  'rejected',
  'needs_revision'
);

create type public.image_concept_status as enum (
  'draft',           -- Claude が出しただけ
  'prompt_approved', -- 人間が OK（★承認ゲート 1 通過）
  'discarded'
);
```

**subject_class → release_policy の写像**

「Instagram 投稿画像と EC ブランディングの、景色・雰囲気の画像は実運用に回す。
それ以外は公開前のテスト」という方針を、そのまま型に落とす。

| subject_class | 既定 release_policy | 実運用 | Stage 1 に課す制約 |
|---|---|---|---|
| `scenery_mood` | `production` | ○ IG ティザー / EC ブランディング | 白 T を画面内に置かない、または遠景で質感が読み取れない距離に留める |
| `styling_scene` | `production` | △ 雰囲気カットとしてのみ | 着用状態は可。ただし襟・縫製・編み目が読み取れる寄りにしない |
| `product_depiction` | `internal_test`（固定） | × | テスト専用。実物と異なる商品を提示しうるため |
| `fabric_macro` | `internal_test`（固定） | × | テスト専用。生地の質感は実物と一致しない |

`product_depiction` / `fabric_macro` は **DB 制約で `internal_test` に固定**する。
設定ミスやアプリのバグで実運用に出る経路を作らない。

```sql
alter table public.image_briefs
  add constraint image_briefs_release_policy_guard
  check (
    subject_class not in ('product_depiction', 'fabric_macro')
    or release_policy = 'internal_test'
  );
```

`styling_scene` を `production` に含めるのは、IG ティザーの現実的な絵作りに
着用カットが要るため。ただし **商品カット（PDP のメイン画像）としては使わない**。
レビュー画面にその注意を常時表示し、`image_assets.is_ai_generated` で追跡できるようにする。

### 2.2 テーブル一覧

| テーブル | 役割 | 1 行の意味 |
|---|---|---|
| `image_briefs` | 人間の依頼 | 「何のために画像が要るか」 |
| `image_prompt_templates` | Claude のシステムプロンプト版管理 | 「Stage 2 の v3」 |
| `image_concepts` | Claude のコンセプト案 | 「この構図・この光で撮る」1 案 |
| `image_generation_jobs` | プロバイダへの 1 送信 | 「この RenderSpec を 4 枚」 |
| `image_generation_results` | ジョブが生んだ 1 枚 | MJ の 4 枚グリッドなら 4 行 |
| `image_assets` | 承認済みの確定資産 | 公開バケットにある 1 枚 |
| `image_review_events` | 承認の監査ログ | 「誰がいつ何を却下したか」 |
| `image_provider_events` | 外部イベントの生ログ | webhook / poll の生 JSON |
| `image_cost_ledger` | 課金の記録 | 予算サーキットブレーカーの根拠 |
| `integration_outbox` | 外部連携の送信箱 | n8n へ配る 1 イベント（第 9 章） |

### 2.3 スキーマ案

```sql
-- ---------------------------------------------------------------------------
-- image_briefs : 人間が起こす依頼
-- ---------------------------------------------------------------------------
create table public.image_briefs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  purpose public.image_purpose not null,
  -- 何を写すか。これが実運用可否を決める（第 2.1 節の写像表）
  subject_class public.image_subject_class not null default 'scenery_mood',
  release_policy public.image_release_policy not null default 'internal_test',
  -- 何を訴えたいか（人間の言葉。Claude への主入力）
  intent text not null default '',
  -- 参照する自社データ。Claude に商品/生地の実データを渡すため
  product_id uuid references public.products(id) on delete set null,
  fabric_slug text references public.fabrics(slug) on delete set null,
  -- 制約（枚数、締切、使ってはいけない要素）
  desired_variant_count smallint not null default 4
    check (desired_variant_count between 1 and 8),
  constraints jsonb not null default '{}'::jsonb,
  due_date date,
  created_by text not null default 'admin',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index image_briefs_purpose_idx on public.image_briefs (purpose, created_at desc);

create trigger image_briefs_set_updated_at
  before update on public.image_briefs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- image_prompt_templates : Claude プロンプトのバージョン管理
--   「なぜこの絵が出たか」を後から再現するための土台
-- ---------------------------------------------------------------------------
create table public.image_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  role text not null check (role in ('director', 'prompt_engineer', 'qa')),
  version integer not null,
  model text not null,                       -- 例: claude-opus-5
  system_prompt text not null,
  params jsonb not null default '{}'::jsonb, -- max_tokens, temperature 等
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  unique (role, version)
);

-- role ごとに有効なテンプレは 1 つだけ
create unique index image_prompt_templates_one_active_per_role
  on public.image_prompt_templates (role)
  where is_active = true;

-- ---------------------------------------------------------------------------
-- image_concepts : Claude Stage 1/2 の出力
-- ---------------------------------------------------------------------------
create table public.image_concepts (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references public.image_briefs(id) on delete cascade,
  -- 再指示ループ用。親コンセプトを指す
  parent_concept_id uuid references public.image_concepts(id) on delete set null,
  revision smallint not null default 1,
  status public.image_concept_status not null default 'draft',

  title text not null,
  -- Stage 1 の構造化出力（構図・光・スタイリング・ムード）
  concept jsonb not null,
  -- Stage 2 の出力 = プロバイダ非依存の中間表現
  render_spec jsonb,
  -- 人間が手で直した場合の上書き（監査のため元は残す）
  render_spec_override jsonb,

  director_template_id uuid references public.image_prompt_templates(id),
  engineer_template_id uuid references public.image_prompt_templates(id),
  claude_input_tokens integer not null default 0,
  claude_output_tokens integer not null default 0,

  approved_by text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index image_concepts_brief_idx on public.image_concepts (brief_id, revision);
create index image_concepts_status_idx on public.image_concepts (status);

create trigger image_concepts_set_updated_at
  before update on public.image_concepts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- image_generation_jobs : プロバイダへの 1 送信 = 状態機械の本体
-- ---------------------------------------------------------------------------
create table public.image_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid not null references public.image_concepts(id) on delete cascade,
  status public.image_job_status not null default 'queued',

  -- プロバイダ
  provider text not null,                    -- 'mock' | 'midjourney_proxy' | ...
  provider_job_id text,                      -- 受理後に埋まる
  -- 実際に送った内容（プロバイダ固有に変換済み）。再現性のため必ず保存
  submitted_prompt text not null default '',
  submitted_params jsonb not null default '{}'::jsonb,
  requested_variant_count smallint not null default 4,
  seed bigint,

  -- 二重送信 = 二重課金の防止。unique 制約が最後の砦
  idempotency_key text not null unique,

  -- リトライ制御
  attempt_count smallint not null default 0,
  max_attempts smallint not null default 5,
  next_attempt_at timestamptz not null default now(),

  -- ワーカーのリース（複数インスタンスでの二重処理防止）
  claimed_by text,
  claimed_at timestamptz,
  lease_expires_at timestamptz,

  -- 失敗情報（正規化済み。生は image_provider_events）
  error_category text,   -- transient | permanent | policy | auth | budget | integrity
  error_code text,
  error_message text,

  -- コスト
  estimated_cost_jpy numeric(10,2) not null default 0,
  actual_cost_jpy numeric(10,2),

  -- 生存時間の上限。超えたら reaper が expired にする
  expires_at timestamptz not null default (now() + interval '2 hours'),

  submitted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ワーカーが拾うためのインデックス
create index image_jobs_pickup_idx
  on public.image_generation_jobs (status, next_attempt_at)
  where status in ('queued', 'submitted', 'running', 'succeeded');

create index image_jobs_provider_job_idx
  on public.image_generation_jobs (provider, provider_job_id);

create index image_jobs_concept_idx on public.image_generation_jobs (concept_id);

create trigger image_generation_jobs_set_updated_at
  before update on public.image_generation_jobs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- image_generation_results : ジョブが生んだ 1 枚（レビュー単位）
-- ---------------------------------------------------------------------------
create table public.image_generation_results (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.image_generation_jobs(id) on delete cascade,
  variant_index smallint not null,

  -- プロバイダの一時 URL。期限切れ前提なので参考情報としてのみ保持
  source_url text,
  source_url_expires_at timestamptz,
  -- 取り込み後の非公開バケット上のパス（これが正）
  storage_bucket text,
  storage_path text,
  width integer,
  height integer,
  content_type text,
  bytes integer,
  checksum text,

  -- 部分失敗（この 1 枚だけ DL 失敗）を表現する
  download_error text,

  -- Claude Stage 3 の評価。人間の判断材料
  qa_verdict text check (qa_verdict in ('recommend', 'borderline', 'reject')),
  qa_scores jsonb,
  qa_issues jsonb not null default '[]'::jsonb,
  alt_text_ja text,
  alt_text_en text,
  caption_draft text,

  review_state public.image_review_state not null default 'pending_review',
  reviewed_by text,
  reviewed_at timestamptz,
  review_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, variant_index)
);

create index image_results_review_idx
  on public.image_generation_results (review_state, created_at desc);

create trigger image_generation_results_set_updated_at
  before update on public.image_generation_results
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- image_assets : 承認され公開バケットに置かれた確定資産
--   product_images への紐付けはさらに別操作（承認 ≠ 公開）
-- ---------------------------------------------------------------------------
create table public.image_assets (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null unique
    references public.image_generation_results(id) on delete restrict,
  purpose public.image_purpose not null,
  subject_class public.image_subject_class not null,

  -- image_assets の存在 = 公開バケットにコピー済み、という意味なので
  -- internal_test の行は原理的に作れない。アプリのバグでも DB が拒否する
  release_policy public.image_release_policy not null default 'production'
    check (release_policy = 'production'),

  public_bucket text not null,     -- 'product-images' | 'site-images'
  public_path text not null,
  public_url text not null,
  alt_text_ja text not null default '',
  alt_text_en text not null default '',

  -- 出所の明示。AI 生成であることを運用上も追跡できるようにする
  is_ai_generated boolean not null default true,
  generation_provider text not null,

  -- 利用先（紐付け済みかどうか）
  attached_product_id uuid references public.products(id) on delete set null,
  attached_fabric_slug text references public.fabrics(slug) on delete set null,
  attached_content_key text,

  created_by text not null,
  created_at timestamptz not null default now()
);

create index image_assets_purpose_idx on public.image_assets (purpose, created_at desc);

-- ---------------------------------------------------------------------------
-- image_review_events : 承認・却下の監査ログ（append only）
-- ---------------------------------------------------------------------------
create table public.image_review_events (
  id uuid primary key default gen_random_uuid(),
  result_id uuid not null
    references public.image_generation_results(id) on delete cascade,
  action text not null
    check (action in ('approve', 'reject', 'request_revision', 'publish', 'unpublish')),
  from_state public.image_review_state,
  to_state public.image_review_state,
  actor text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index image_review_events_result_idx
  on public.image_review_events (result_id, created_at);

-- ---------------------------------------------------------------------------
-- image_provider_events : webhook / poll の生ログ
--   重複 webhook を弾く冪等キーを兼ねる
-- ---------------------------------------------------------------------------
create table public.image_provider_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.image_generation_jobs(id) on delete cascade,
  provider text not null,
  provider_event_id text,       -- プロバイダ側のイベント ID（あれば）
  source text not null check (source in ('webhook', 'poll', 'submit')),
  payload jsonb not null,
  received_at timestamptz not null default now()
);

-- 同じ webhook が 2 回来ても 1 回しか処理しない
create unique index image_provider_events_dedupe_idx
  on public.image_provider_events (provider, provider_event_id)
  where provider_event_id is not null;

create index image_provider_events_job_idx
  on public.image_provider_events (job_id, received_at desc);

-- ---------------------------------------------------------------------------
-- image_cost_ledger : 予算サーキットブレーカーの根拠
-- ---------------------------------------------------------------------------
create table public.image_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.image_generation_jobs(id) on delete set null,
  kind text not null check (kind in ('claude', 'image_provider')),
  provider text not null,
  amount_jpy numeric(10,2) not null,
  detail jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index image_cost_ledger_month_idx
  on public.image_cost_ledger (date_trunc('month', occurred_at), kind);
```

### 2.4 ワーカーのジョブ取得（行ロック）

Supabase JS クライアントからは `SELECT ... FOR UPDATE SKIP LOCKED` が直接書けない。
**Postgres 関数を用意して `rpc()` で呼ぶ。**

```sql
create or replace function public.claim_image_jobs(
  p_worker_id text,
  p_statuses public.image_job_status[],
  p_limit integer default 5,
  p_lease_seconds integer default 120
)
returns setof public.image_generation_jobs
language plpgsql
security definer
as $$
begin
  return query
  with picked as (
    select id
    from public.image_generation_jobs
    where status = any(p_statuses)
      and next_attempt_at <= now()
      and (lease_expires_at is null or lease_expires_at < now())
    order by next_attempt_at
    limit p_limit
    for update skip locked          -- ★ 複数ワーカーでも二重処理しない
  )
  update public.image_generation_jobs j
     set claimed_by = p_worker_id,
         claimed_at = now(),
         lease_expires_at = now() + make_interval(secs => p_lease_seconds)
    from picked
   where j.id = picked.id
  returning j.*;
end;
$$;
```

### 2.5 RLS

既存スキーマ同様、当面 RLS は無効のまま **service role 経由のみ**でアクセスする
（アプリ側の `admin` セッションが唯一の入口なので、これで閉じている）。
Supabase Auth ベースの管理者に移行する際に、以下の方針で有効化する。

- `image_*` 全テーブル: anon / authenticated からの SELECT を **一切許可しない**
- `image_assets.public_url` が指す公開バケットのみが外部に見える面

### 2.6 Storage バケット（2 つに分ける）

**これが承認フローの技術的な核**。未承認画像が公開 URL を持たないことを、
運用ルールではなくバケット分離で担保する。

```sql
-- 未承認の生成物。公開しない
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-image-drafts', 'ai-image-drafts', false, 20971520,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 公開読み取りポリシーは作らない（= service role の signed URL でしか読めない）
```

- **`ai-image-drafts`（private, 新規）** — 生成直後の取り込み先。管理画面には
  有効期限 5 分程度の signed URL でのみ表示する
- **`product-images` / `site-images`（public, 既存）** — 承認された資産のコピー先

`next.config.ts` の `images.remotePatterns` は既に `**.supabase.co` を許可済みなので、
`next/image` の設定変更は不要。

### 2.7 types/database.ts

既存の手書き行型に合わせて `ImageBriefRow` / `ImageGenerationJobRow` などを追加する。
`types/admin-image.ts` を新設し、管理画面向けの DTO（`AdminImageJobListItem` 等）を
`types/admin-product.ts` と同じ粒度で定義する。

---

## 3. API ルート案

### 3.1 管理 API — `/api/admin/images/**`

`middleware.ts` の matcher `/api/admin/:path*` が既にカバーするので、
**追加のミドルウェア設定は不要**。各ハンドラでは既存ルート同様
`requireAdminSession()` を呼び、`AdminAuthError` を 401 に変換する。

| メソッド | パス | 役割 |
|---|---|---|
| `POST` | `/api/admin/images/briefs` | ブリーフ作成 |
| `GET` | `/api/admin/images/briefs` | 一覧（purpose / 期間で絞り込み） |
| `GET` | `/api/admin/images/briefs/[id]` | 詳細 + 紐づくコンセプト・ジョブ |
| `PATCH` | `/api/admin/images/briefs/[id]` | 編集 |
| `POST` | `/api/admin/images/briefs/[id]/concepts` | **Claude Stage 1**。コンセプト N 件生成（同期・数秒） |
| `PATCH` | `/api/admin/images/concepts/[id]` | 人間による手直し（`render_spec_override`） |
| `POST` | `/api/admin/images/concepts/[id]/render-spec` | **Claude Stage 2**。RenderSpec 生成 |
| `POST` | `/api/admin/images/concepts/[id]/approve` | ★承認ゲート 1。`prompt_approved` へ |
| `POST` | `/api/admin/images/concepts/[id]/jobs` | ジョブを `queued` で INSERT して即返す |
| `GET` | `/api/admin/images/jobs` | 一覧。管理画面のポーリング先 |
| `GET` | `/api/admin/images/jobs/[id]` | 詳細（状態・エラー・結果） |
| `POST` | `/api/admin/images/jobs/[id]/cancel` | 中止 |
| `POST` | `/api/admin/images/jobs/[id]/retry` | 手動リトライ（新しい idempotency_key で再投入） |
| `GET` | `/api/admin/images/review` | レビュー待ち一覧（signed URL 込み） |
| `POST` | `/api/admin/images/results/[id]/review` | ★承認ゲート 2。approve / reject / request_revision |
| `POST` | `/api/admin/images/results/[id]/qa` | **Claude Stage 3** を手動再実行 |
| `GET` | `/api/admin/images/results/[id]/signed-url` | 未承認画像の短命 URL 発行 |
| `POST` | `/api/admin/images/assets/[id]/attach` | product_images / site_content へ紐付け |
| `POST` | `/api/admin/images/assets/[id]/detach` | 紐付け解除 |
| `GET` | `/api/admin/images/budget` | 今月の消費額と上限（UI 警告用） |

**ハンドラの形**（既存 `app/api/admin/orders/[id]/status/route.ts` に合わせる）:

```ts
type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await context.params;
    // ...
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    // ...
  }
}
```

### 3.2 内部 API — `/api/internal/images/**`

`app/api/internal/apply-pricing/route.ts` の `Bearer <secret>` パターンを踏襲。
シークレットは専用に `IMAGE_WORKER_SECRET` を切る（権限の分離）。

| メソッド | パス | 役割 |
|---|---|---|
| `POST` | `/api/internal/images/tick` | ワーカー本体。1 回の呼び出しで下記を実行 |
| `POST` | `/api/internal/images/reap` | リース切れ / 期限切れジョブの回収（tick に内包でも可） |
| `POST` | `/api/internal/outbox/dispatch` | 外部連携イベントの配信（第 9 章） |

`tick` の 1 回の仕事（各ステップは件数上限つき。1 回の実行を短く保つ）:

1. `claim_image_jobs(['queued'])` → `provider.submit()` → `submitted`
2. `claim_image_jobs(['submitted','running'])` → `provider.poll()` → 状態更新
3. `claim_image_jobs(['succeeded'])` → 画像を `ai-image-drafts` へ取り込み → `stored`
4. `stored` になった result に対し Claude Stage 3 を実行（任意・後追い可）
5. `lease_expires_at` 切れをリース解放、`expires_at` 超過を `expired` へ

### 3.3 Webhook — `/api/webhooks/images/[provider]`

`middleware.ts` の matcher 対象外なので **署名検証が唯一の防御**。
Stripe webhook と同じく、**生のボディ文字列**（`await request.text()`）で HMAC を検証する。
`request.json()` を先に呼ぶと署名が合わなくなる。

処理順:

1. `IMAGE_PROVIDER_WEBHOOK_SECRET` 未設定 → 503
2. 署名ヘッダなし / 不一致 → 400（本文は読まない）
3. `image_provider_events` に INSERT。unique 制約違反 = 重複 → **200 で no-op**
4. `provider_job_id` からジョブを引く。見つからない → 200（ログのみ。再送を止める）
5. 状態遷移ガードを通してから更新（第 4.3 節）
6. 常に速やかに 200 を返す。重い処理（画像 DL）は `succeeded` に落として tick に任せる

---

## 4. 画像生成ジョブの状態管理

### 4.1 状態遷移図

```
                    ┌──────────┐
        ┌──────────▶│  queued  │◀────────── 一時的失敗はここへ戻す
        │           └────┬─────┘            (attempt_count++,
        │                │ claim             next_attempt_at = now + backoff)
        │                ▼
        │           ┌────────────┐
        │           │ submitting │──── submit 失敗(transient) ──┐
        │           └────┬───────┘                              │
        │                │ provider_job_id 取得                 │
        │                ▼                                      │
        │           ┌───────────┐                               │
        ├───────────│ submitted │                               │
        │           └────┬──────┘                               │
        │                │ webhook / poll                       │
        │                ▼                                      │
        │           ┌─────────┐                                 │
        ├───────────│ running │ (progress %)                    │
        │           └────┬────┘                                 │
        │                │ 画像 URL が揃った                    │
        │                ▼                                      │
        │           ┌───────────┐                               │
        │           │ succeeded │                               │
        │           └────┬──────┘                               │
        │                │ claim                                │
        │                ▼                                      │
        │           ┌─────────────┐                             │
        └───────────│ downloading │                             │
                    └────┬────────┘                             │
                         │ Storage 保存完了                     │
                         ▼                                      │
                    ┌────────┐                                  │
                    │ stored │ ← 終端（レビュー待ちが発生）     │
                    └────────┘                                  │
                                                                │
   終端(失敗系):                                                │
     failed    ← 恒久エラー / リトライ上限超過 ◀────────────────┘
     cancelled ← 人間が中止
     expired   ← expires_at 超過を reaper が回収
```

### 4.2 リトライは「状態」ではなく「時刻」で表す

`retrying` という状態を作らない。`queued` + `next_attempt_at` + `attempt_count` の
3 つで表現する。状態が減り、ワーカーの取得クエリが 1 本で済む。

```
next_attempt_at = now() + min(2^attempt_count * 30秒, 15分) + jitter(0〜10秒)
                  → 30s, 60s, 120s, 240s, 480s ...
```

jitter を入れるのは、複数ジョブが同時に失敗したとき（プロバイダ障害時）に
リトライが同時に殺到するのを避けるため。

### 4.3 状態遷移ガード（順序逆転への防御）

webhook は **順不同・重複あり**で届く。`running` の通知が `succeeded` より後に来ることがある。
DB 更新は必ず「今の状態が遷移元として妥当なとき」だけ通す。

```
許可される遷移のみを定数表で持ち、UPDATE の WHERE 句に現在状態を含める:

  update image_generation_jobs
     set status = 'running'
   where id = $1
     and status in ('submitted')     -- ★ ガード
```

**終端状態（`stored` / `failed` / `cancelled` / `expired`）は絶対に上書きしない。**
遅れて届いた通知は `image_provider_events` に記録だけして捨てる。

### 4.4 冪等性 = 二重課金の防止

`idempotency_key` は `concept_id + revision + attempt + provider` から決定的に作り、
テーブルに UNIQUE 制約を張る。加えて、対応しているプロバイダには
`Idempotency-Key` ヘッダとして同じ値を送る。

**手動リトライだけは新しいキーを発行する**（人間が「もう一度課金してよい」と
判断した操作なので、意図的に別ジョブ扱いにする）。

### 4.5 リース（複数ワーカー対策）

Vercel の cron が重なったり、外部スケジューラと二重に叩かれても壊れないように、
`claim_image_jobs()` で `lease_expires_at` を握ってから処理する。
ワーカーが途中で死んでもリースが自然に切れて別のワーカーが拾う。

### 4.6 管理画面への進捗表示

管理画面は `GET /api/admin/images/jobs?brief_id=...` を **5 秒間隔でポーリング**する。
SSE / WebSocket は初期実装では使わない（Vercel 上での運用が複雑になるだけで、
数秒〜数分のジョブには過剰）。

---

## 5. Claude へのプロンプト設計

### 5.1 3 つの役割を 1 つのプロンプトに詰め込まない

| Stage | 役割 | モデル | 出力 |
|---|---|---|---|
| **1. Director** | ブリーフ → コンセプト案 N 件 | `claude-opus-5` | 構図・光・スタイリング・ムード |
| **2. Prompt Engineer** | コンセプト → RenderSpec | `claude-sonnet-5` | プロバイダ非依存の中間表現 |
| **3. QA / Art Director** | 生成画像 → 評価と alt text | `claude-sonnet-5`（vision） | verdict・issue・alt text・キャプション案 |

分ける理由は 3 つ。
**(a)** Stage 1 は創造性、Stage 2 は正確なフォーマット遵守で、要求が真逆。
**(b)** 失敗したステージだけをやり直せる。
**(c)** Stage 1 だけ高いモデルを使えばコストが抑えられる。

### 5.2 共通のブランドコンテキスト（プロンプトキャッシュ対象）

全 Stage の system プロンプト先頭に、同一のブランドブロックを置く。
このブロックは長く・不変なので **prompt caching（`cache_control: ephemeral`）を効かせる**。

ブランドブロックの中身は DB から動的に組む（ハードコードしない）:

- `lib/brand/kanemasa.ts` — 和歌山の自社工場、自社の編み機
- `site_content` テーブルのブランドコピー / トーン
- `fabrics` テーブルの当該生地（`character_thickness` 〜 `character_surface` の 5 軸を
  そのまま「質感の指示」として渡せるのが強み）
- `products` テーブルの `material` / `fit_type` / `sleeve_type` / `fit_note`

```
<brand>
WHITE TEE は、和歌山の自社工場（カネマサ）で編んだ生地で作る白い T シャツのブランド。
トーン: 静か、余白がある、説明しすぎない。誇張・煽り・過度な演出をしない。
禁止: ロゴの捏造、実在ブランド名、実在人物の顔、派手な色、雑然とした背景、
      文字やタイポグラフィの描画（後から載せるため画像内に文字を入れない）。
</brand>

<fabric name="Compact Cotton" >
  厚み 3/5、柔らかさ 4/5、ハリ 2/5、透け 2/5、表面感 3/5
  → 光を吸う。硬い直射光ではなく、拡散した自然光で質感が出る。
</fabric>
```

### 5.3 Stage 1: Director

**system**: ブランドブロック + 用途別の制約 + 「必ず tool を使って返す」

用途別の制約は定数表で持つ:

| purpose | アスペクト比 | 構図の要件 |
|---|---|---|
| `instagram_teaser` | 4:5 / 1:1 | 上下に余白（後からテキストを載せる）。1 枚で完結する強さ |
| `ec_hero` | 16:9 / 3:2 | 商品が明確に主役。左右どちらかにコピー用の余白 |
| `product_lp` | 3:4 | ディテール寄り。編み目・縫製・落ち感が読み取れる |
| `journal` | 3:2 | 引きの画。人・場所・空気 |
| `fabric` | 1:1 | 生地そのもののマクロ。手触りが想像できる |

さらに **`subject_class` ごとの制約を system プロンプトに注入する**。
実運用に出る `scenery_mood` / `styling_scene` では、商品の質感を「語らせない」ことが要点。

```
<subject_constraints class="scenery_mood">
主題は光・空気・場所・時間帯。白い T シャツを画面の主役にしない。
写り込む場合も、編み目・襟のリブ・縫製が読み取れない距離・ピントに留める。
「この生地はこう見える」と受け手が判断できる情報を画面に置かない。
</subject_constraints>

<subject_constraints class="styling_scene">
着用シーンは可。ただしディテールに寄らない。
襟元・肩線・袖口のアップ、生地の拡大は禁止。
シルエットと佇まいで語る。
</subject_constraints>
```

`product_depiction` / `fabric_macro` は `internal_test` 専用なので、
プロンプト側の制約は緩めてよい（実運用に出ないため）。ただし
**生成物を商品ページに使わない**ことがレビュー画面と DB 制約の両方で担保されている。

**user**: ブリーフの `intent` + `constraints` + 商品/生地の実データ

**出力の強制**: tool use（`emit_concepts`）で JSON スキーマを縛る。
自由文で JSON を書かせない。

```
emit_concepts(concepts: [{
  title: string,
  rationale: string,              // なぜこの案がブリーフに応えるか（人間が選ぶ材料）
  subject: string,                // 何が写っているか
  composition: string,            // 構図・カメラ位置・焦点距離の感じ
  lighting: string,               // 光の質
  color_palette: string[],        // 3〜5 色
  styling: string,                // スタイリング・小物
  environment: string,            // 場所・背景
  mood_keywords: string[],
  avoid: string[],                // この案で特に避けるべきもの
  aspect_ratio: "1:1"|"4:5"|"3:2"|"3:4"|"16:9",
  usage_note: string              // 想定の使いどころ
}])
```

### 5.4 Stage 2: Prompt Engineer

**核心の設計判断: Claude に `--ar 4:5 --stylize 250` を直接書かせない。**

プロバイダ固有の記法を Claude に出力させると、プロバイダを乗り換えた瞬間に
プロンプト資産が全部使えなくなる。Claude には **プロバイダ非依存の中間表現
（RenderSpec）** だけを出させ、**文字列化はアダプタの責任**にする。

```
emit_render_spec({
  base_prompt: string,          // 英語の描写文。パラメータは含めない
  negative: string[],           // 避けたい要素（対応プロバイダのみ使用）
  aspect_ratio: "1:1"|"4:5"|"3:2"|"3:4"|"16:9",
  stylization: number,          // 0.0〜1.0 に正規化。アダプタが各社のスケールへ写像
  variation: number,            // 0.0〜1.0（MJ の chaos 相当）
  detail_level: "low"|"standard"|"high",
  reference_hint: string | null,
  reasoning: string             // なぜこの表現にしたか（人間のレビュー用）
})
```

`stylization: 0.4` を Midjourney 系では `--stylize 400`、
Flux では別のパラメータへ、mock では無視する — という写像をアダプタに閉じ込める。

**入力にプロバイダの capabilities を渡す**（第 6 章の `capabilities`）。
対応していないアスペクト比を Claude が選ばないようにする。

### 5.5 Stage 3: QA / Art Director

生成画像を vision で渡し、**人間が見るべき点を先に潰す**。

```
emit_review({
  verdict: "recommend" | "borderline" | "reject",
  scores: {
    brand_fit: 1-5,          // ブランドのトーンに合っているか
    white_reproduction: 1-5, // 白 T が白く、階調が飛んでいないか（本ブランドの生命線）
    fabric_plausibility: 1-5,// 指定した生地の質感として妥当か
    artifacts: 1-5,          // 指・縫製・破綻の有無（低いほど破綻あり）
    commercial_usability: 1-5
  },
  issues: [{ severity: "blocker"|"minor", description: string }],
  alt_text_ja: string,
  alt_text_en: string,
  caption_draft: string,     // IG 用の下書き。そのまま投稿はしない
  retouch_notes: string[]
})
```

**明文化しておく設計上の約束:**
Stage 3 の `verdict` は **自動承認に使わない**。`reject` でも人間が承認できるし、
`recommend` でも人間が却下できる。Claude は並び順とハイライトを決めるだけ。

### 5.6 プロンプトのバージョン管理

system プロンプトはコードにハードコードせず `image_prompt_templates` に置く。

- 生成物には常に `director_template_id` / `engineer_template_id` を記録
- 「先月の絵の方が良かった」が起きたとき、どのプロンプトで出たか追跡できる
- テンプレの差し替えに再デプロイが要らない

### 5.7 ガードレール

- **禁止語チェック**（Claude 呼び出しの前後 2 回）— 実在ブランド名、実在人物名、
  他社ロゴ。ヒットしたらジョブを作らずエラーにする
- **未公開情報を送らない** — ブリーフに発売前の価格・発売日を書かない運用ルールを
  UI のヘルプに明記する
- **法務上の線引き（決定済み）** — AI 生成画像を **実際の商品写真の代替として使わない**。
  生地の質感や色が実物と異なるまま商品ページに出すのは景品表示法上の優良誤認リスクがある。
  実運用に出すのは **Instagram 投稿画像と EC ブランディングの、景色・雰囲気の画像
  （`scenery_mood` / `styling_scene`）に限定**する。商品・生地の描写
  （`product_depiction` / `fabric_macro`）は公開前のテスト専用。
  この線引きは運用ルールではなく **enum + CHECK 制約 + 承認時の検証**で強制する
  （第 2.1 / 7.7 節）。`image_assets.is_ai_generated` で常に追跡できる

---

## 6. Midjourney API 連携部分の抽象化設計

### 6.1 前提となるリスク

**Midjourney には公式 API が存在しない（2026-08 時点）。**
「Midjourney API」を名乗るサービスは、Discord の自動化やアカウントプール経由の
非公式プロキシであることがほとんど。これは設計上、次のように扱う。

> **プロバイダは「いつ消えてもいい部品」として設計する。**
> 消えたときに失うのが「アダプタ 1 ファイル」だけで済む形にする。

| リスク | 内容 | 設計上の対策 |
|---|---|---|
| **規約違反 / BAN** | 非公式プロキシは MJ の ToS 違反の可能性。アカウント凍結で予告なく停止 | アダプタを差し替え可能に。公式 API を持つ代替（Flux / Replicate / OpenAI Images）を最初から 2 系統目として想定 |
| **サービス消滅** | 小規模事業者が多く、廃業・値上げ・仕様変更が突然 | RenderSpec（プロバイダ非依存）を DB に保存 → 別プロバイダで**再生成できる**状態を常に保つ |
| **商用利用権が不明** | MJ の商用ライセンスは MJ の契約者に付与される。プロキシ経由だと権利が自社に帰属しない可能性 | **Phase 0 で法務確認を必須にする**。確認が取れるまで EC の商品ページには使わない |
| **画像 URL の失効** | プロバイダの CDN URL は数時間〜数日で切れる | **受領後すぐ Supabase Storage へ再ホスト。外部 URL を DB の正としない**（`source_url` は参考情報） |
| **レイテンシ非決定** | 30 秒〜数分。混雑時はさらに | 非同期ジョブ前提。UI は待たせない。`expires_at` で打ち切る |
| **価格変動 / クレジット制** | 残高切れで全ジョブが失敗 | `image_cost_ledger` + 月次上限 + サーキットブレーカー |
| **再現性がない** | 同じプロンプトで同じ絵が出ない | `seed` を保存。`submitted_prompt` と `submitted_params` を必ず保存 |
| **情報漏洩** | プロンプトが第三者サーバーに残る | 未公開の商品情報を送らない運用ルール（第 5.7 節） |

### 6.2 インターフェース

`lib/images/providers/types.ts`（実装しないが、契約はここで固める）:

```ts
export type ImageProviderId =
  | "mock"
  | "midjourney_proxy"
  | "replicate_flux"
  | "openai_images";

export type AspectRatio = "1:1" | "4:5" | "3:2" | "3:4" | "16:9";

/** プロバイダに依存しない生成要求。RenderSpec + ジョブ情報から作る */
export type GenerationRequest = {
  idempotencyKey: string;
  basePrompt: string;
  negative: string[];
  aspectRatio: AspectRatio;
  stylization: number;   // 0.0-1.0 に正規化。写像はアダプタの責任
  variation: number;     // 0.0-1.0
  detailLevel: "low" | "standard" | "high";
  variantCount: number;
  seed?: number;
  referenceImageUrls?: string[];
  webhookUrl?: string;
};

export type NormalizedJobStatus =
  | "submitted" | "running" | "succeeded" | "failed" | "cancelled";

export type NormalizedErrorCategory =
  | "transient"   // 429 / 5xx / タイムアウト → リトライする
  | "permanent"   // 400 / 422 → リトライしない
  | "policy"      // コンテンツポリシー拒否 → 人間へ
  | "auth"        // 401 / 403 → サーキットブレーカー
  | "budget"      // 残高不足 → サーキットブレーカー
  | "integrity";  // 画像が壊れている

export type NormalizedError = {
  category: NormalizedErrorCategory;
  code: string;
  message: string;
  retryAfterSeconds?: number;   // 429 の Retry-After を尊重する
};

export type ProviderImage = {
  index: number;
  url: string;
  urlExpiresAt?: string;
  width?: number;
  height?: number;
};

export type SubmitResult = {
  providerJobId: string;
  status: NormalizedJobStatus;
  raw: unknown;                 // 生ログ。image_provider_events へ
};

export type PollResult = {
  status: NormalizedJobStatus;
  progress?: number;
  images: ProviderImage[];
  error?: NormalizedError;
  actualCostJpy?: number;
  raw: unknown;
};

export type ProviderCapabilities = {
  maxVariants: number;
  supportedAspectRatios: AspectRatio[];
  supportsWebhook: boolean;
  supportsSeed: boolean;
  supportsNegativePrompt: boolean;
  supportsReferenceImage: boolean;
  typicalLatencySeconds: number;
  estimatedCostPerImageJpy: number;
};

export interface ImageProvider {
  readonly id: ImageProviderId;
  readonly capabilities: ProviderCapabilities;

  /** RenderSpec → プロバイダ固有の文字列。監査のため submit とは別に取れる形にする */
  buildPrompt(req: GenerationRequest): { prompt: string; params: Record<string, unknown> };

  submit(req: GenerationRequest): Promise<SubmitResult>;
  poll(providerJobId: string): Promise<PollResult>;

  /** 署名検証込み。検証失敗は例外、対象外イベントは null */
  parseWebhook(
    headers: Headers,
    rawBody: string,
  ): Promise<{ providerJobId: string; event: PollResult } | null>;

  cancel?(providerJobId: string): Promise<void>;
  estimateCostJpy(req: GenerationRequest): number;
}
```

### 6.3 レジストリ

`lib/supabase/env.ts` の `getDataSource()` と同じ形にする。
**env が未設定なら黙って mock に落ちる** — 開発環境でキーなしで動く。

```ts
// lib/images/providers/registry.ts
export function getImageProviderId(): ImageProviderId {
  const explicit = process.env.IMAGE_PROVIDER;
  if (explicit === "mock") return "mock";
  if (!process.env.IMAGE_PROVIDER_API_KEY) return "mock";  // キーがなければ mock
  return (explicit as ImageProviderId) ?? "mock";
}

export function getImageProvider(id = getImageProviderId()): ImageProvider { /* ... */ }
```

### 6.4 MockProvider の仕様（Phase 2 で実装する唯一のプロバイダ）

モックは「すぐ成功を返す」だけだと状態機械のテストにならない。
**現実の嫌な挙動を再現できる**ようにする。

- `submit()` は即座に `providerJobId` を返す
- `poll()` は経過時間で `running`(0〜N 秒) → `succeeded` と遷移する
  （`IMAGE_MOCK_LATENCY_MS` で調整）
- `IMAGE_MOCK_FAILURE_RATE` で確率的に `transient` エラーを返す → リトライ経路を実際に踏む
- 返す画像は `public/` 配下のプレースホルダ画像、または
  アスペクト比を焼き込んだ SVG（`scripts/generate-model-wear-svgs.js` に前例あり）
- 4 枚要求すれば 4 枚返す。**うち 1 枚だけ壊れた URL を返すモード**も持たせ、
  部分失敗の処理を確認する

### 6.5 プロバイダ健全性とサーキットブレーカー

`auth` / `budget` エラーは 1 件でも起きたら **そのプロバイダの全ジョブを止める**。
残高切れで 50 件が順にリトライして全部失敗する、を防ぐ。

- `site_content` か専用の小テーブルに `image_provider_health` フラグを持つ
- 開いている間、`tick` は新規 submit をスキップし、管理画面に警告を出す
- 解除は人間の手動操作（`POST /api/admin/images/provider/reset`）

---

## 7. 人間承認フロー

### 7.1 承認は 2 箇所 + 公開はさらに 1 箇所

```
  ゲート 1: コンセプト承認（安い）
     ↓  ここで捨てれば画像生成コストがかからない
  [生成]
     ↓
  ゲート 2: 画像承認（必須）
     ↓  非公開バケット → 公開バケットへコピーされるのはここだけ
  [image_assets 作成]
     ↓
  公開操作: product_images / site_content への紐付け（別アクション）
```

**承認 ≠ 公開に分ける理由**: 「この画像は使ってよい」と「この画像を今この商品ページに出す」は
別の判断。承認済み資産をストックしておき、必要になったときに貼る運用ができる。

### 7.2 未承認画像の見せ方

未承認画像は `ai-image-drafts`（非公開バケット）にあり、公開 URL を持たない。
管理画面には **有効期限 5 分の signed URL** を都度発行して表示する。

```
GET /api/admin/images/review
  → results[] にそれぞれ signedUrl（expiresIn: 300）を付けて返す
  → 画面を開きっぱなしにすると切れるので、フロント側で再取得する
```

この設計により、**未承認画像が外部に漏れる経路が構造的に存在しない**。
（URL を知っていれば誰でも見られる、が起きない）

### 7.3 レビュー画面 `/admin/images/review`

既存の `components/admin/` の流儀（`OrdersTable` / `StatusBadge` /
`AdminConfirmDialog`）に合わせて構成する。

表示するもの:

- 生成画像のグリッド（同一ジョブの N 枚を並べる）
- Claude Stage 3 の verdict バッジ と `issues`（blocker は赤）
- 元になったブリーフの `intent` とコンセプトの `rationale`
  — **何を狙った画像かを見ながら判断できるようにする**
- 使ったプロンプト（折りたたみ）と seed
- コスト

操作:

| 操作 | 挙動 |
|---|---|
| **承認** | `approved` へ。公開バケットへコピー、`image_assets` を作成。alt text は Claude 案を初期値にした編集可能フィールドで、**空のままでは承認できない** |
| **却下** | `rejected` へ。**却下理由の入力を必須にする**（後で Claude へのフィードバックに使う） |
| **再指示** | `needs_revision` へ。指摘を書くと、それを Stage 1 に食わせて子コンセプト（`parent_concept_id` / `revision + 1`）を作る |
| **一括却下** | ジョブ単位でまとめて却下（4 枚とも駄目、が頻繁に起きる） |

すべての操作は `image_review_events` に append される。

### 7.4 再指示ループ

```
result#3 を却下「首元の縫製がブランドの仕様と違う」
   ↓
concept(rev1) + 却下理由 → Claude Stage 1
   ↓
concept(rev2)  parent_concept_id = concept(rev1).id
   ↓
再度ゲート 1 → 生成 → ゲート 2
```

`revision` に上限（例: 5）を設け、それ以上は人間がブリーフから作り直す。
無限ループでコストが溶けるのを防ぐ。

### 7.5 Instagram は「自動投稿しない」

承認済み資産に対してできるのは **エクスポートまで**。

- 画像のダウンロード（公開 URL / zip）
- キャプション案のコピー
- 将来 n8n 経由で「Instagram の下書きを作る」ところまで（第 9 章）

**投稿ボタンは作らない。** 完全自動投稿を将来やるとしても、
それは本設計の範囲外として別途合意する。

### 7.6 レビュワーの識別（既知の弱点）

現状の管理者認証は `ADMIN_PASSWORD` の共有パスワード方式
（`lib/admin/session-token.ts`）で、**個人を識別できない**。
`reviewed_by` / `actor` には当面 `"admin"` しか入らない。

- 短期: セッション Cookie に発行時のラベルを含め、ログイン時に名前を選ばせる（簡易）
- 中期: **Supabase Auth ベースの管理者アカウントへ移行**して `auth.users.id` を記録する

承認の監査ログが意味を持つのは個人が識別できてから。
テーブル設計は最初から `actor text` を持たせておき、移行時に埋められるようにする。

### 7.7 公開ポリシーの強制（3 重）

`internal_test` の画像が実運用に出ないことを、3 箇所で独立に担保する。
どれか 1 つが壊れても止まる。

| 層 | 仕組み |
|---|---|
| **DB** | `image_assets.release_policy` に `check (release_policy = 'production')`。internal_test の資産行は物理的に作れない |
| **アプリ** | 承認ハンドラが `brief.release_policy` を読み、`internal_test` なら公開バケットへのコピーを実行せず `approved` で止める |
| **UI** | レビュー画面に `internal_test` バッジを常時表示。承認ボタンのラベルを「承認（テスト。公開されません）」に変える |

`internal_test` の承認は「この生成結果は妥当だった」という記録に留まり、
`ai-image-drafts` バケットから外へ出ない。

### 7.8 エージェント（Claude Code）による自動承認の範囲

「自動で回せるフロー」を作るうえで、承認ゲートが完全な人手依存だとループが閉じない。
そこで **`internal_test` に限ってエージェントの承認を許す**。

| 対象 | ゲート 1（コンセプト） | ゲート 2（画像） |
|---|---|---|
| `internal_test` | エージェント可 | **エージェント可** |
| `production` | エージェント可（生成コストのみ） | **人間のみ。例外なし** |

- 監査ログの `actor` は `agent:claude` と記録し、人間の承認と**必ず区別できる**ようにする
- 制御は環境変数 `IMAGE_AGENT_AUTOPILOT`。取りうる値は **`off`（既定）と `internal_test_only` の 2 つだけ**

**`production` を自動承認できる設定値を作らない**のが要点。
「一時的に全自動にする」フラグは、いつか本番で入りっぱなしになる。
値として存在しなければ、その事故は起きない。

`production` のブリーフは、エージェントが生成してレビューキューに積むところまでやり、
そこで止まって人間を待つ。これが本設計の唯一の停止点であり、意図的にそう設計している。

---

## 8. エラー時の扱い

### 8.1 エラーの分類と対応（これが全ての判断基準）

| category | 例 | リトライ | 状態 | 通知 |
|---|---|---|---|---|
| `transient` | 429 / 500 / 503 / タイムアウト / ネットワーク | する（指数バックオフ + jitter、最大 5 回） | `queued` に戻す | 上限到達時のみ |
| `permanent` | 400 / 422 / 不正なアスペクト比 | **しない** | `failed` | 即時 |
| `policy` | コンテンツポリシー拒否 | **しない** | `failed` | 即時。プロンプト修正を促す |
| `auth` | 401 / 403 / キー失効 | **しない** | `failed` + **ブレーカー開** | 即時・強調 |
| `budget` | 残高不足 / クレジット切れ | **しない** | `failed` + **ブレーカー開** | 即時・強調 |
| `integrity` | 画像 DL 失敗 / 壊れたファイル | する（3 回まで） | result 単位で失敗 | 上限到達時 |

429 に `Retry-After` があれば **バックオフ計算より優先**する。

### 8.2 部分失敗を成功として扱う

4 枚中 2 枚しか取り込めなかった場合:

- ジョブは `stored`（**`failed` にしない**）
- 取り込めた 2 枚は正常にレビュー待ちになる
- 失敗した 2 枚は `image_generation_results.download_error` を持つ行として残す
- レビュー画面に「4 枚中 2 枚取得失敗」と表示する

「全部か無か」にすると、使える画像を捨てることになる。

### 8.3 Webhook のエラー

| ケース | 応答 | 理由 |
|---|---|---|
| 署名不一致 | 400 | 本文を信用しない |
| 重複イベント | **200** | 再送を止める。no-op |
| 未知の `provider_job_id` | **200** | 再送を止める。生ログだけ残す |
| 終端状態への遅延イベント | **200** | 遷移ガードで弾いて no-op |
| 内部処理で例外 | 500 | プロバイダに再送させる |

**Webhook ハンドラでは画像をダウンロードしない。** `succeeded` にして即 200 を返し、
重い処理は `tick` に任せる。webhook のタイムアウトで再送地獄になるのを避ける。

### 8.4 スタックしたジョブの回収（reaper）

外部 API を叩くジョブは必ず「返事が来ない」が起きる。

| 条件 | 処置 |
|---|---|
| `lease_expires_at < now()` かつ非終端 | リースを解放して再取得可能にする |
| `expires_at < now()`（既定 2 時間）かつ非終端 | `expired` へ。管理画面に表示 |
| `submitted` のまま 30 分以上 poll が進まない | `provider.poll()` を強制実行し、それでも不明なら `expired` |

### 8.5 Claude 側の失敗

| ケース | 対応 |
|---|---|
| 構造化出力のパース失敗 | `temperature` を下げて **1 回だけ**再試行。それでも駄目なら concept を `discarded` にして人間へ |
| API がレート制限 | 指数バックオフ。Stage 1/2 は同期呼び出しなので、UI に「混雑しています」を返す |
| Claude の拒否（refusal） | **自動で言い換えて再送しない**。ブリーフの内容に問題がある可能性を人間に提示する |
| トークン上限超過 | ブランドコンテキストを削らず、参照商品数を減らす方向で調整 |
| Stage 3 の失敗 | **ジョブ全体を失敗させない**。QA なしでレビュー待ちに入れ、画面に「AI 評価なし」と出す |

### 8.6 予算のサーキットブレーカー

`image_cost_ledger` の当月合計が `IMAGE_MONTHLY_BUDGET_JPY` を超えたら、
**新規ジョブの投入自体を止める**（実行中のものは完走させる）。

- 80% で管理画面に警告
- 100% で `POST /api/admin/images/concepts/[id]/jobs` が 402 相当を返す
- 解除は人間の明示操作のみ

### 8.7 ユーザーへのエラー表示

既存ルートと同じく、`NextResponse.json({ error: message }, { status })` 形式。
ただし **プロバイダの生エラーをそのまま画面に出さない**
（内部 URL やキーの断片が混ざりうる）。正規化した `error_category` と
人間向けの説明文を返し、生ログは `image_provider_events` にだけ残す。

---

## 9. 将来的な n8n / Make 連携案

### 9.1 境界の引き方

n8n / Make を **アプリの内側に入れない**。入口と出口の 2 つの穴だけ開ける。

```
                    ┌────────────────────────────┐
   [入口]  ─────────▶│                            │
   POST /api/webhooks/automation                  │
   HMAC 署名 + allowlist されたアクションのみ     │
                    │   white-tee-ec (Next.js)   │
                    │   ・API キーを持つ唯一の場所│
   [出口]  ◀─────────│   ・承認判断が起きる唯一の場所
   integration_outbox → HMAC 署名付き POST        │
                    └────────────────────────────┘
```

| n8n にやらせてよい | n8n にやらせない |
|---|---|
| Slack / メール通知（「レビュー待ちが 4 件」） | **API キーの保持** |
| 承認画面へのリンク配布 | **承認判断そのもの** |
| 承認済み資産を Drive / スプレッドシートへ同期 | **DB への直接書き込み** |
| Instagram の**下書き**作成 | 自動投稿 |
| 定期的なブリーフ起票（新商品公開の N 日前） | プロンプトの生成 |
| 外部スケジューラとして `/api/internal/images/tick` を叩く | ジョブ状態の直接更新 |

### 9.2 出口 — Outbox パターン

イベントを直接 n8n に POST すると、n8n が落ちている間のイベントが消える。
**DB に書いてから配る。**

```sql
create table public.integration_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,          -- image.review_pending / image.approved / image.job_failed
  payload jsonb not null,
  status text not null default 'pending'
    check (status in ('pending', 'delivered', 'failed')),
  attempt_count smallint not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_error text,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create index integration_outbox_pickup_idx
  on public.integration_outbox (status, next_attempt_at)
  where status = 'pending';
```

`POST /api/internal/outbox/dispatch`（cron）が pending を拾い、
`N8N_WEBHOOK_URL` へ HMAC 署名付きで POST する。

- **at-least-once**（少なくとも 1 回届く。重複はありうる）
- `id` をイベント ID として送り、**n8n 側で重複排除**する
- リトライはジョブと同じ指数バックオフ
- 署名: `X-WhiteTee-Signature: sha256=<hmac(N8N_SIGNING_SECRET, rawBody)>`

配信するイベント:

| event_type | タイミング | 用途 |
|---|---|---|
| `image.review_pending` | ジョブが `stored` になった | 「レビューお願いします」通知 |
| `image.approved` | 承認された | Drive 同期 / IG 下書き |
| `image.rejected` | 却下された | 記録 |
| `image.job_failed` | ジョブが `failed` / `expired` | 障害通知 |
| `image.budget_warning` | 予算 80% / 100% | コスト警告 |

**payload に signed URL を入れない**（n8n の実行ログに残り、期限内は誰でも見られる）。
`resultId` と管理画面の URL だけを送り、画像は管理画面で見る。

### 9.3 入口 — Automation Webhook

```
POST /api/webhooks/automation
  X-WhiteTee-Signature: sha256=...
  { "action": "create_brief", "payload": { ... } }
```

- 許可するアクションは **allowlist**（当面 `create_brief` のみ）
- `create_brief` は「ブリーフを作る」だけ。**Claude 呼び出しもジョブ投入もしない**
  （外部から課金を発生させられる穴を作らない）
- ブリーフ作成後は通常どおり人間がゲート 1 を通す

### 9.4 Make / Zapier

同じ HMAC 境界を使う。ツール固有の実装を Next.js 側に持ち込まない。
n8n 用の分岐を書かず、「署名付き webhook を送受信できるツール」として一様に扱う。

---

## 10. 実行基盤とスケジューリング

### 10.1 結論

| 局面 | 何で回すか |
|---|---|
| **開発・テスト中** | `npm run images:tick` / `images:drain`。**スケジューラ不要** |
| **本番の主経路** | プロバイダの **webhook**。遅延ゼロ、スケジューラ不要 |
| **本番の安全網** | **GitHub Actions**（10 分間隔 + 手動実行） |
| **分単位の確実性が要るなら** | Supabase `pg_cron` + `pg_net`（DB の隣で動く） |

### 10.2 GitHub Actions を使う判断

**使う。ただし「主」ではなく「安全網 + 手動トリガー」として。**

このリポジトリは **public** なので、判断材料が private の場合と変わる。

**利点**

- **public リポジトリは標準ランナーの Actions が無料・無制限**。
  10 分間隔（月 4,320 回）でもコストがかからない。private だと
  1 実行 1 分課金で無料枠 2,000 分を大きく超えるため、この構成は成立しなかった
- `workflow_dispatch` で手動および API から任意のタイミングで叩ける
  → エージェントからも人間からも「今すぐ回す」ができる
- Vercel のプランに依存しない（Hobby のままでよい）

**制約（これがあるので「主」にしない）**

- `schedule` の**最小間隔は 5 分**
- **スケジュール実行は保証されない。** GitHub 全体が高負荷のとき遅延・スキップされる。
  数十分ずれることがある。画像 1 枚に 30 秒〜3 分しかかからないのに、
  結果が見えるまで 20 分待つのは体験として成立しない
- public リポジトリの scheduled workflow は
  **60 日間リポジトリに活動がないと自動停止**する（GitHub から通知が来る）

→ **完了検知は webhook に任せ、GitHub Actions は「取りこぼしと stuck job の回収」に徹する。**
これなら 10 分遅延しても実害がない。

### 10.3 ワークフロー設計

`.github/workflows/image-pipeline-tick.yml`（Phase 6 で追加）:

```yaml
name: image-pipeline-tick

on:
  schedule:
    - cron: "*/10 * * * *"   # 安全網。主経路は webhook
  workflow_dispatch:          # 手動 / API から即時実行

concurrency:
  group: image-pipeline-tick
  cancel-in-progress: false   # 重なったら直列化。ジョブ側のリースと二重防御

jobs:
  tick:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: POST /api/internal/images/tick
        env:
          TICK_URL: ${{ secrets.IMAGE_TICK_URL }}
          TICK_SECRET: ${{ secrets.IMAGE_WORKER_SECRET }}
        run: |
          curl -fsS -X POST "$TICK_URL" \
            -H "Authorization: Bearer $TICK_SECRET" \
            -H "content-type: application/json" \
            --max-time 120 \
            -o /dev/null
```

- リポジトリのチェックアウトすらしない。**HTTP を 1 本叩くだけ**にして、
  ロジックは Route Handler の 1 箇所に置く
- `-o /dev/null` と `-fsS` で、レスポンス本文をログに出さない
- `IMAGE_TICK_URL` も secret にする（本番 URL をワークフローファイルに書かない）

### 10.4 public リポジトリでの注意点

| 注意 | 理由 |
|---|---|
| **`pull_request_target` を使うワークフローを足さない** | fork からの PR に secrets を渡してしまう典型的な事故。public リポジトリでは特に危険 |
| `schedule` / `workflow_dispatch` は安全 | base リポジトリの文脈で動くため、fork から secrets を盗めない |
| **secrets を `echo` しない。`curl -v` を使わない** | Actions のログは公開される。マスキングは万能ではない |
| **tick エンドポイントの防御は Bearer シークレットのみ** | パスは公開情報。レート制限を入れ、401 は本文を返さない |
| 設計書・スキーマも公開される | 本設計は秘匿性に依存していない（HMAC + Bearer + service role）。このまま public で問題ない |

### 10.5 エージェント（Claude Code）が回すためのスクリプト

既存 `scripts/*.mjs` の流儀（dotenv + Node スクリプト）に合わせる。
ただし **状態機械のロジックをスクリプトに再実装しない**。
`.mjs` から TypeScript の `lib/` を直接 import できないので、
スクリプトは **自分の Route Handler を HTTP で叩く薄いクライアント**にする。
ロジックは常に 1 箇所（`/api/internal/images/tick`）に留まる。

| コマンド | 役割 |
|---|---|
| `npm run images:tick` | tick を 1 回叩く |
| `npm run images:drain -- --brief <id> --timeout 600` | 全ジョブが終端に達するまで tick をポーリングし続ける（エージェントの主力） |
| `npm run images:status -- --brief <id>` | ブリーフ配下の状態を表で出す |
| `npm run images:autopilot -- --brief <id>` | `internal_test` 限定。生成 → drain → 自動承認まで一気に回す |

- 既定の宛先は `http://localhost:3000`（`npm run dev` 前提）。`--remote` で本番
- `images:autopilot` は `IMAGE_AGENT_AUTOPILOT=internal_test_only` のときのみ動作し、
  `production` のブリーフに対しては**明示的にエラーで止まる**（第 7.8 節）

これにより、**テスト段階ではスケジューラを一切用意せずに**
「ブリーフ投入 → コンセプト → 生成 → 取り込み → QA → 承認」の
エンドツーエンドをエージェントが単独で回して検証できる。

---

## 11. 実装ステップ

各フェーズは **それ単体で動作確認できる** 単位に切ってある。
CLAUDE.md のルールどおり、フェーズ開始前に必ず `git fetch origin && git pull origin main`。

### Phase 0 — 合意と確認（コード変更なし）

- [ ] `node_modules/next/dist/docs/` を読み、Route Handler / `params` の規約を確認（`AGENTS.md` の要求）
- [x] **AI 生成画像の用途の線引き** → 決定。`scenery_mood` / `styling_scene` を実運用
      （IG・EC ブランディング）、`product_depiction` / `fabric_macro` はテスト専用
- [x] **スケジューラ構成** → 決定。webhook が主、GitHub Actions が安全網、
      テスト中はスクリプト。Vercel は Hobby のままでよい
- [ ] サードパーティ画像 API 候補の **商用利用権と ToS を確認**（唯一残った要確認事項）
- [ ] 月次予算の上限額を決める
- [ ] 環境変数の名前を確定（第 12 章）

**完了条件**: 商用利用権の確認が取れ、予算が決まっている

### Phase 1 — DB とリポジトリ層

- [ ] `supabase/migrations/add-image-generation.sql`（enum / テーブル / インデックス / トリガ）
      — `image_subject_class` / `image_release_policy` と、公開ポリシーの CHECK 制約を含む
- [ ] `supabase/migrations/add-ai-image-drafts-bucket.sql`（非公開バケット）
- [ ] `supabase/migrations/add-claim-image-jobs-function.sql`（行ロック関数）
- [ ] `types/database.ts` に行型追加、`types/admin-image.ts` 新設
- [ ] `lib/db/images/{repository,admin-repository,mapper}.ts`（`lib/db/products/` と同型）

**完了条件**: `npm run db:migrate` が通り、リポジトリ層経由でブリーフの CRUD ができる

### Phase 2 — プロバイダ抽象 + Mock

- [ ] `lib/images/providers/types.ts`（第 6.2 節のインターフェース）
- [ ] `lib/images/providers/mock.ts`（遅延・確率的失敗・部分失敗を再現）
- [ ] `lib/images/providers/registry.ts`（`getDataSource()` と同じ形）

**完了条件**: 実 API キーなしで mock が画像 URL を返す

### Phase 3 — ジョブランナー（ここが心臓部）

- [ ] `lib/images/jobs/state-machine.ts`（遷移表とガード）
- [ ] `lib/images/jobs/runner.ts`（claim → submit → poll → download → store）
- [ ] `lib/images/storage.ts`（`lib/admin/image-upload.ts` を拡張し非公開バケット対応）
- [ ] `app/api/internal/images/tick/route.ts`（Bearer 認証）
- [ ] reaper（リース解放 / `expired` 回収）
- [ ] `scripts/images/{tick,drain,status}.mjs` + `package.json` の scripts 追加
      — tick を HTTP で叩くだけの薄いクライアント（第 10.5 節）

**完了条件**: mock でジョブを投入すると、`npm run images:drain` だけで
`ai-image-drafts` に画像が入り `stored` になる。`IMAGE_MOCK_FAILURE_RATE` を上げると
リトライ経路が実際に走る。**この時点でスケジューラはまだ不要**

### Phase 4 — Claude 連携（Stage 1 / 2）

- [ ] `@anthropic-ai/sdk` 追加、`ANTHROPIC_API_KEY` はサーバー専用
- [ ] `lib/images/director/context.ts`（ブランドコンテキスト組み立て + prompt caching）
- [ ] `lib/images/director/{concepts,render-spec}.ts`（tool use による構造化出力）
- [ ] `image_prompt_templates` の初期データ投入
- [ ] 禁止語チェック

**完了条件**: ブリーフを渡すとコンセプト N 件が返り、RenderSpec まで生成される

### Phase 5 — 管理 UI

- [ ] `/admin/images` — ブリーフ一覧・作成
- [ ] `/admin/images/[briefId]` — コンセプト確認・★ゲート 1・ジョブ投入・進捗ポーリング
- [ ] `/admin/images/review` — ★ゲート 2（承認 / 却下 / 再指示）
- [ ] `internal_test` バッジと承認ボタンのラベル出し分け（第 7.7 節）
- [ ] `components/admin/` に既存の流儀で追加（`StatusBadge` / `AdminConfirmDialog` 再利用）
- [ ] `AdminShell` のナビに導線追加
- [ ] `scripts/images/autopilot.mjs`（`internal_test` 限定の自動承認。第 7.8 節）

**完了条件**: ブラウザだけで「ブリーフ → コンセプト → 生成(mock) → 承認 → 資産化」が完走する。
かつ `internal_test` のブリーフなら `npm run images:autopilot` で
エージェントが単独で同じ経路を回せる。`production` のブリーフでは自動承認が拒否される

### Phase 6 — 実プロバイダ 1 本

> ⚠️ **このフェーズに入る前に、商用利用権の確認（未決事項 4）を済ませること。**
> `internal_test` だけで検証する範囲なら Phase 1〜5 は先に進めてよいが、
> `production` の画像を実運用に出すには権利の確認が前提になる。

- [ ] アダプタ実装（1 社のみ）
- [ ] `app/api/webhooks/images/[provider]/route.ts`（HMAC 検証、生ボディで）
- [ ] `image_cost_ledger` への記録とサーキットブレーカー
- [ ] `.github/workflows/image-pipeline-tick.yml`（安全網。第 10.3 節）
- [ ] Actions secrets に `IMAGE_TICK_URL` / `IMAGE_WORKER_SECRET` を登録
- [ ] **ステージングで少額の実課金テスト**（1 ジョブ 4 枚から）

**完了条件**: 実画像が承認フローに乗る。webhook が切れても Actions の tick が
10 分以内に回収する。予算上限で正しく止まる

### Phase 7 — Claude QA（Stage 3）

- [ ] vision で生成画像を評価、alt text / キャプション案を生成
- [ ] レビュー画面に verdict と issues を表示
- [ ] QA 失敗時にジョブを落とさないことを確認

**完了条件**: レビュー画面が「見るべき順」に並ぶ

### Phase 8 — 外部連携

- [ ] `integration_outbox` + `/api/internal/outbox/dispatch`
- [ ] `/api/webhooks/automation`（`create_brief` のみ）
- [ ] n8n 側で Slack 通知フローを 1 本

**完了条件**: レビュー待ちが Slack に飛ぶ

---

## 12. 付録

### 12.1 環境変数

すべてサーバー専用。**`NEXT_PUBLIC_` を付けたものは 1 つもない。**

| 変数 | 用途 | 既定 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API | 未設定なら Claude 機能を無効化して UI に表示 |
| `IMAGE_PROVIDER` | `mock` / `midjourney_proxy` / ... | `mock` |
| `IMAGE_PROVIDER_API_KEY` | プロバイダ認証。**未設定なら自動で mock** | — |
| `IMAGE_PROVIDER_BASE_URL` | プロバイダのエンドポイント | — |
| `IMAGE_PROVIDER_WEBHOOK_SECRET` | webhook の HMAC 検証 | 未設定なら webhook は 503 |
| `IMAGE_WORKER_SECRET` | `/api/internal/images/*` の Bearer | 未設定なら 503 |
| `IMAGE_MONTHLY_BUDGET_JPY` | 月次上限 | — |
| `IMAGE_MOCK_LATENCY_MS` | mock の遅延（開発用） | `3000` |
| `IMAGE_MOCK_FAILURE_RATE` | mock の失敗率（開発用） | `0` |
| `IMAGE_AGENT_AUTOPILOT` | エージェント自動承認。**`off` / `internal_test_only` の 2 値のみ** | `off` |
| `IMAGE_TICK_URL` | GitHub Actions から叩く tick の URL（Actions secret） | — |
| `N8N_WEBHOOK_URL` | outbox の配信先 | 未設定なら配信スキップ |
| `N8N_SIGNING_SECRET` | 入口・出口の HMAC 鍵 | — |

既存（変更なし）: `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` /
`SUPABASE_SERVICE_ROLE_KEY` / `ADMIN_SESSION_SECRET` / `ADMIN_PASSWORD` / `DATABASE_URL`

### 12.2 この設計が明示的に「やらない」こと

- 完全自動投稿（Instagram / X への直接投稿）
- Claude の判定による自動承認
- **`production` ポリシー資産のエージェント自動承認**（設定値として存在させない）
- クライアントサイドからの画像生成 API 呼び出し
- 未承認画像の公開バケットへの保存
- 外部 webhook からの課金発生（ジョブ投入）
- 生成画像の商品写真・生地写真としての利用（`internal_test` に固定）
- `pull_request_target` を使うワークフローの追加（public リポジトリでの secrets 漏洩経路）

### 12.3 未決事項

**決定済み**

1. ~~AI 生成画像の用途の線引き~~ → `scenery_mood` / `styling_scene` を実運用
   （Instagram 投稿・EC ブランディング）、`product_depiction` / `fabric_macro` は
   公開前テスト専用。DB 制約で強制（第 2.1 / 7.7 節）
2. ~~スケジューラ構成~~ → webhook 主 + GitHub Actions 安全網 + テスト中はスクリプト。
   public リポジトリなので Actions は無料（第 10 章）
3. ~~エージェント自動化の範囲~~ → `internal_test` に限り全自動、
   `production` の画像承認は人間のみ（第 7.8 節）

**未決（Phase 0 で決める）**

4. **サードパーティ API の商用利用権** — 経由して生成した画像の権利が自社に帰属するか。
   **実運用に出す `production` 画像に直接効くので、Phase 6 の前に必須**
   （`internal_test` だけなら Phase 1〜5 は先に進められる）
5. **月次予算の上限額**
6. **管理者が複数人か** — 承認の監査ログを機能させるには個人識別が要る（現状は共有パスワード）。
   エージェント承認を入れるぶん、`actor` の区別は今より重要になる
7. **プロバイダの第 1 候補と第 2 候補** — 2 系統目を最初から想定しておくかどうか

# 画像生成パイプライン 引き継ぎメモ

最終更新: 2026-08-11 / 引き継ぎ元: Claude Code (web) → Cursor

設計の全体像は `docs/image-generation-workflow.md`（約1900行）にある。
このファイルはその要約ではなく、**いま手を動かす人が最初に知る必要のあること**だけを書く。

---

## 1. まず何より

**正常系がまだ一度も通っていない。**

ブリーフ作成 → コンセプト生成 → ジョブ投入 → 画像保存 → 承認、という本来の
流れを最後まで走らせた実績がない。型チェック・ビルド・DB制約・ジョブランナーの
疎通（GitHub Actions から 200）までは確認済みだが、**画像が1枚も生成されていない**。

次にやるべきは機能追加ではなく、この一周を mock で通すこと。手順は第5節。

---

## 2. いまの状態

### 動いているもの

| | 状態 |
|---|---|
| 本番デプロイ | `main` から Vercel、成功 |
| DB スキーマ | Supabase 本番に適用済み（`image_*` 9テーブル + `integration_outbox`） |
| ジョブランナー | GitHub Actions が5分ごとに叩く。手動実行で success 確認済み |
| 管理画面 | `/admin/images`、`/admin/images/[id]`、`/admin/images/review` |
| 生成エンジン | **`mock`**（ダミーPNGを返す。課金なし） |

### 環境変数（Vercel 本番）

すべて設定済み。`ANTHROPIC_API_KEY` と `IMAGE_PROVIDER_API_KEY` は Production のみ。

`.env.example` に全変数の説明がある。**ローカルの `.env.local` には
画像パイプライン系が入っていない**ので、Cursor で動かすなら以下を追加する:

```
ANTHROPIC_API_KEY=          # platform.claude.com
IMAGE_PROVIDER=mock         # mock のままにすること
IMAGE_WORKER_SECRET=        # 任意の値でよい（ローカルは本番と別でよい）
IMAGE_MONTHLY_BUDGET_JPY=20000
```

`ADMIN_PASSWORD` は本番で更新済み。ローカルの値と食い違っているので、
管理画面をローカルで使うなら揃えること。

---

## 3. 踏むと痛い罠

### Next.js のバージョン

`AGENTS.md` にある通り、**このプロジェクトの Next.js は学習データと違う**。
コードを書く前に `node_modules/next/dist/docs/` の該当ガイドを読むこと。
Route Handler の `params` が `Promise` になっているなど、実際に差がある。

### マイグレーション

- `supabase/migrations/*.sql` は**ファイル名のアルファベット順**に適用される。
  依存関係がある場合は1ファイルにまとめること（`add-image-generation.sql` が
  テーブルと `claim_image_jobs()` を同居させているのはこのため）。
- 本番には `public.schema_migrations` 台帳がある。既存27本は「適用済み」として
  記録済み。**`update-site-copy-tone.sql` や `update-premium-pricing.sql` は
  データ上書き系**なので、台帳を消して流し直すと管理画面での編集が巻き戻る。
- `DATABASE_URL` はデプロイ時の postbuild で使われる。接続に失敗すると
  ビルドごと落ちるが、`run-migrations.mjs` が原因を診断して出す
  （パスワードは桁数だけ表示、値は出さない）。

### Claude API

- Opus 5 は `temperature` / `top_p` / `top_k` を**受け付けない**（400になる）。
  `budget_tokens` も無い。
- 構造化出力は `output_config.format` に JSON Schema を渡す方式。
- `stop_reason: "refusal"` のハンドリングが `lib/images/director/` に入っている。

### FLUX（まだ有効化していない）

- **生成結果のURLは10分で失効する。** ダウンロードは即座に行う必要がある。
- webhook 未実装。いまは polling のみ。
- そのため **GitHub Actions の5分間隔だけで無人運用してはいけない**。
  Actions のスケジュールは遅延・欠落するので、10分の失効に間に合わない可能性がある。
  無人運用するなら webhook の実装が先（設計書 §6.1.1）。
- BFL のクレジット未購入。`IMAGE_PROVIDER=flux_bfl` にする前に課金が必要。

### リリースポリシー

`subject_class` から `release_policy` が導出され、**3層で独立に強制**されている:

1. DB の CHECK 制約（`image_briefs_release_policy_guard`）
2. アプリ（`lib/images/release-policy.ts`）
3. UI（フォームでは入力させない）

`product_depiction` と `fabric_macro` は `internal_test` 固定 = **公開されない**。
AI生成画像を商品写真・生地写真として使わないという判断（設計書 §7.7）。
ここを緩める変更は3箇所すべてを触ることになる。意図的にそう作ってある。

---

## 4. 残タスク

| 優先 | 内容 |
|---|---|
| 高 | **mock で正常系を一周**（第5節） |
| 中 | `IMAGE_WORKER_SECRET` のローテーション。**Vercel と GitHub Actions secrets の両方を同時に**更新すること。片方だけだと定期実行が401で落ちる |
| 中 | 管理ログインに試行回数制限。`app/api/admin/login/route.ts` は無制限かつ `!==` 比較（セッションCookie側は `timingSafeEqualHex` で定数時間になっている） |
| 低 | FLUX webhook（無人運用の前提条件） |
| 低 | 参照画像セットのUI・自動添付 |
| 低 | `/api/webhooks/automation`（n8n/Make からの受信口） |

---

## 5. mock で一周する手順

課金は Claude 呼び出しのみ（約¥28）。画像生成は mock なので無料。

1. `/admin/images` →「ブリーフを作成」
   - 被写体は **`景色・雰囲気`**（`scenery_mood`）を選ぶ。実運用可のクラス
2. 詳細画面 →「Claude にコンセプトを生成させる」（30秒ほど、約¥14）
3. 案を選んで「この案で画像を生成」（約¥14、ジョブが `queued` に入る）
4. 「ジョブを今すぐ進める」（5分待たずに tick が走る）
5. 状態が `queued → submitted → stored` と進むのを確認
6. `/admin/images/review` で承認

止まった場合の調べ方:

```bash
npm run images:status   # DATABASE_URL が必要
```

Vercel の Runtime Logs も見ること。ジョブの失敗理由は
`image_generation_jobs.last_error` と `image_provider_events` に残る。

---

## 6. 作業のルール

`CLAUDE.md` の通り。特に:

- **作業前に必ず `git fetch origin && git pull origin main`**。
  Claude Code と Cursor のどちらが先に push しているか分からない
- 通常の作業ブランチは `main`
- 同じファイルを同時に触らない

現時点で `main` と `claude/white-tee-image-workflow-ccvl0l` は同一。
未コミットの変更もない。

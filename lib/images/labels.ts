import type {
  ImageJobStatus,
  ImagePurpose,
  ImageReleasePolicy,
  ImageReviewState,
  ImageSubjectClass,
} from "@/types/database";

/** Japanese labels and badge styling for the image pipeline admin screens. */

export const IMAGE_PURPOSE_LABELS: Record<ImagePurpose, string> = {
  instagram_teaser: "Instagram ティザー",
  ec_hero: "EC ヒーロー",
  product_lp: "商品 LP",
  journal: "Journal",
  fabric: "生地",
};

export const IMAGE_SUBJECT_CLASS_LABELS: Record<ImageSubjectClass, string> = {
  scenery_mood: "景色・雰囲気",
  styling_scene: "着用シーン",
  product_depiction: "商品の描写",
  fabric_macro: "生地マクロ",
};

/**
 * Wording matters here. "Test only" has to read as a property of the work,
 * not as a failure, or reviewers will treat it as something to fix.
 */
export const IMAGE_RELEASE_POLICY_LABELS: Record<ImageReleasePolicy, string> = {
  production: "実運用",
  internal_test: "テスト専用（公開されません）",
};

export const IMAGE_RELEASE_POLICY_BADGE: Record<ImageReleasePolicy, string> = {
  production: "bg-emerald-50 text-emerald-800",
  internal_test: "bg-neutral-100 text-neutral-700",
};

export const IMAGE_JOB_STATUS_LABELS: Record<ImageJobStatus, string> = {
  queued: "待機中",
  submitting: "送信中",
  submitted: "受理済み",
  running: "生成中",
  succeeded: "生成完了",
  downloading: "取り込み中",
  stored: "取り込み完了",
  failed: "失敗",
  cancelled: "中止",
  expired: "期限切れ",
};

export const IMAGE_JOB_STATUS_BADGE: Record<ImageJobStatus, string> = {
  queued: "bg-neutral-100 text-neutral-700",
  submitting: "bg-blue-50 text-blue-800",
  submitted: "bg-blue-50 text-blue-800",
  running: "bg-blue-50 text-blue-800",
  succeeded: "bg-blue-50 text-blue-800",
  downloading: "bg-blue-50 text-blue-800",
  stored: "bg-emerald-50 text-emerald-800",
  failed: "bg-red-50 text-red-800",
  cancelled: "bg-neutral-100 text-neutral-700",
  expired: "bg-amber-50 text-amber-900",
};

export const IMAGE_REVIEW_STATE_LABELS: Record<ImageReviewState, string> = {
  pending_review: "レビュー待ち",
  approved: "承認済み",
  rejected: "却下",
  needs_revision: "再指示",
};

export const IMAGE_QA_VERDICT_LABELS: Record<string, string> = {
  recommend: "推奨",
  borderline: "判断が必要",
  reject: "非推奨",
};

export const IMAGE_QA_VERDICT_BADGE: Record<string, string> = {
  recommend: "bg-emerald-50 text-emerald-800",
  borderline: "bg-amber-50 text-amber-900",
  reject: "bg-red-50 text-red-800",
};

export const IMAGE_ADMIN_COPY = {
  nav: "画像生成",
  review: {
    title: "画像レビュー",
    empty: "レビュー待ちの画像はありません。",
    approve: "承認",
    approveTestOnly: "承認（テスト・公開されません）",
    reject: "却下",
    requestRevision: "再指示",
    noteLabel: "理由・メモ",
    noteRequired: "却下・再指示には理由が必要です。",
    altTextJaLabel: "代替テキスト（日本語・必須）",
    altTextEnLabel: "代替テキスト（英語）",
    altTextRequired: "承認には日本語の代替テキストが必要です。",
    briefIntent: "このブリーフの狙い",
    concept: "コンセプト",
    downloadFailed: "この画像は取得に失敗しています。承認できません。",
    /**
     * Shown on styling_scene work. It ships, but a worn shot is not a
     * product shot, and the reviewer is the last person who can catch that.
     */
    stylingSceneWarning:
      "着用シーンです。雰囲気カットとしてのみ使用し、商品カットには使わないでください。",
    aiNotice: "AI 生成画像です。実物と質感・色が異なります。",
  },
  briefs: {
    title: "画像ブリーフ",
    empty: "ブリーフがまだありません。",
    columns: {
      title: "タイトル",
      purpose: "用途",
      subjectClass: "被写体",
      releasePolicy: "公開可否",
      pending: "レビュー待ち",
      updatedAt: "更新",
    },
  },
  budget: {
    label: "今月の画像生成コスト",
    warning: "月次予算の 80% を超えています。",
    exceeded: "月次予算を使い切りました。新規ジョブは投入できません。",
  },
} as const;

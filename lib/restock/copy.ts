export const RESTOCK_COPY = {
  heading: (size: string) => `${size}は在庫切れです。`,
  emailLabel: "メールアドレス",
  emailPlaceholder: "you@example.com",
  submit: "再入荷を知らせる",
  submitting: "送信中",
  success: (size: string) =>
    `${size}の再入荷時に、1回だけお知らせします。`,
  invalidEmail: "メールアドレスの形式をご確認ください。",
  inStock: "このサイズは現在在庫があります。ページを再読み込みしてください。",
  rateLimited:
    "短時間に続けて送信されました。少し時間をおいて、もう一度お試しください。",
  unavailable:
    "ただいま受け付けられませんでした。時間をおいて、もう一度お試しください。",
  notice:
    "メールアドレスは、このサイズの再入荷のお知らせにのみ使用します。ニュースレターには登録されません。",
  privacyLink: "プライバシーポリシー",
} as const;

export type RestockErrorCode =
  | "invalid_request"
  | "invalid_email"
  | "not_found"
  | "in_stock"
  | "rate_limited"
  | "unavailable";

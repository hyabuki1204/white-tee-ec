import { defineCopy } from "@/lib/i18n/define-copy";

export const getRestockCopy = defineCopy(
  {
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
  },
  {
    heading: (size: string) => `Size ${size} is out of stock.`,
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    submit: "Notify me",
    submitting: "Sending",
    success: (size: string) =>
      `We will email you once, when size ${size} is back in stock.`,
    invalidEmail: "Please check the format of the email address.",
    inStock: "This size is in stock now. Please reload the page.",
    rateLimited:
      "Too many requests in a short time. Please wait a little and try again.",
    unavailable:
      "We could not take your request just now. Please try again in a little while.",
    notice:
      "We use your email address only to tell you when this size is back in stock. You will not be added to the newsletter.",
    privacyLink: "Privacy policy",
  },
);

export type RestockCopy = ReturnType<typeof getRestockCopy>;

export type RestockErrorCode =
  | "invalid_request"
  | "invalid_email"
  | "not_found"
  | "in_stock"
  | "rate_limited"
  | "unavailable";

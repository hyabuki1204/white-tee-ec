import type { ProductSize } from "@/types";

/** Shapes shared by the concierge API route and its client component. */

export type ConciergeLanguage = "ja" | "en";

export type ConciergeRole = "user" | "assistant";

export type ConciergeTurn = {
  role: ConciergeRole;
  content: string;
};

export type ConciergeRequestBody = {
  messages: ConciergeTurn[];
  /** Slug of the product page the customer came from, if any. */
  contextSlug?: string | null;
};

export type ConciergeStockState = "in_stock" | "low" | "out" | "unknown";

/** One recommendation, already joined with live catalog data on the server. */
export type ConciergeCard = {
  productId: string;
  productSlug: string;
  name: string;
  gauge: number | null;
  silhouette: "Regular" | "Box";
  /** Null when the customer has not given enough to size them yet. */
  size: ProductSize | null;
  price: number;
  imageUrl: string;
  stock: ConciergeStockState;
  /** Units purchasable for this size, capped; 0 when size is null or sold out. */
  available: number;
  href: string;
  reason: string;
};

export type ConciergeLink = {
  href: string;
  label: string;
};

export type ConciergeSource = "model" | "rules";

export type ConciergeReply = {
  reply: string;
  primary: ConciergeCard | null;
  alternative: ConciergeCard | null;
  followUpQuestion: string | null;
  links: ConciergeLink[];
};

export type ConciergeSuccessResponse = ConciergeReply & {
  ok: true;
  /** Debugging only. The UI must never render or branch on this. */
  source: ConciergeSource;
};

export type ConciergeErrorCode =
  | "invalid_request"
  | "message_too_long"
  | "rate_limited"
  | "forbidden"
  | "unavailable";

export type ConciergeErrorResponse = {
  ok: false;
  error: ConciergeErrorCode;
  retryAfterSeconds?: number;
};

export type ConciergeResponse =
  | ConciergeSuccessResponse
  | ConciergeErrorResponse;

/** A recommendation before it is joined with the catalog. */
export type RawRecommendation = {
  productSlug: string;
  size: ProductSize | null;
  reason: string;
};

export type RawConciergeResult = {
  reply: string;
  primary: RawRecommendation | null;
  alternative: RawRecommendation | null;
  followUpQuestion: string | null;
};

/**
 * Supabase table row types.
 * Replace or extend with `supabase gen types` output when the project is connected.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type OrderStatus =
  | "pending"
  | "paid"
  | "shipped"
  | "cancelled"
  | "failed";

export type FabricRow = {
  slug: string;
  name: string;
  tagline: string;
  description_lines: Json;
  image_url: string;
  image_alt: string;
  sort_order: number;
  character_thickness?: number;
  character_softness?: number;
  character_structure?: number;
  character_sheerness?: number;
  character_surface?: number;
  created_at: string;
  updated_at: string;
};

export type FabricInsert = {
  slug: string;
  name: string;
  tagline?: string;
  description_lines?: Json;
  image_url?: string;
  image_alt?: string;
  sort_order?: number;
  character_thickness?: number;
  character_softness?: number;
  character_structure?: number;
  character_sheerness?: number;
  character_surface?: number;
  created_at?: string;
  updated_at?: string;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  detail_description: string;
  fit_note: string | null;
  material: string;
  care: string;
  size_guide: Json;
  is_published: boolean;
  price: number;
  fabric_slug: string | null;
  fit_profile: Json | null;
  sleeve_type: "short" | "long";
  fit_type: "slim" | "regular" | "relaxed" | "boxy";
  created_at: string;
  updated_at: string;
};

export type ProductInsert = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  detail_description?: string;
  fit_note?: string | null;
  material?: string;
  care?: string;
  size_guide?: Json;
  is_published?: boolean;
  price: number;
  fabric_slug?: string | null;
  fit_profile?: Json | null;
  sleeve_type?: "short" | "long";
  fit_type?: "slim" | "regular" | "relaxed" | "boxy";
  created_at?: string;
  updated_at?: string;
};

export type ProductVariantRow = {
  id: string;
  product_id: string;
  size: string;
  sku: string | null;
  stock_quantity: number;
  created_at: string;
};

export type ProductImageRow = {
  id: string;
  product_id: string;
  url: string;
  sort_order: number;
  is_primary: boolean;
  is_card_hover: boolean;
  created_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  status: OrderStatus;
  total_amount: number;
  stripe_payment_intent_id: string | null;
  shipping_address: Json | null;
  order_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderInsert = {
  id?: string;
  user_id?: string | null;
  email?: string | null;
  status?: OrderStatus;
  total_amount: number;
  stripe_payment_intent_id?: string | null;
  shipping_address?: Json | null;
  order_notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  variant: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};

export type OrderItemInsert = {
  id?: string;
  order_id: string;
  product_id: string;
  variant: string;
  quantity: number;
  unit_price: number;
  created_at?: string;
};

export type SiteContentRow = {
  key: string;
  content: Json;
  updated_at: string;
};

export type SiteContentInsert = {
  key: string;
  content: Json;
  updated_at?: string;
};

// ---------------------------------------------------------------------------
// Image generation pipeline
// See docs/image-generation-workflow.md
// ---------------------------------------------------------------------------

export type ImagePurpose =
  | "instagram_teaser"
  | "ec_hero"
  | "product_lp"
  | "journal"
  | "fabric";

/** What is depicted. Decides whether an image may ship. */
export type ImageSubjectClass =
  | "scenery_mood"
  | "styling_scene"
  | "product_depiction"
  | "fabric_macro";

export type ImageReleasePolicy = "production" | "internal_test";

export type ImageJobStatus =
  | "queued"
  | "submitting"
  | "submitted"
  | "running"
  | "succeeded"
  | "downloading"
  | "stored"
  | "failed"
  | "cancelled"
  | "expired";

export type ImageReviewState =
  | "pending_review"
  | "approved"
  | "rejected"
  | "needs_revision";

export type ImageConceptStatus = "draft" | "prompt_approved" | "discarded";

export type ImageErrorCategory =
  | "transient"
  | "permanent"
  | "policy"
  | "auth"
  | "budget"
  | "integrity";

export type ImageQaVerdict = "recommend" | "borderline" | "reject";

export type ImagePromptTemplateRole = "director" | "prompt_engineer" | "qa";

export type ImageBriefRow = {
  id: string;
  title: string;
  purpose: ImagePurpose;
  subject_class: ImageSubjectClass;
  release_policy: ImageReleasePolicy;
  intent: string;
  product_id: string | null;
  fabric_slug: string | null;
  desired_variant_count: number;
  constraints: Json;
  due_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ImageBriefInsert = {
  id?: string;
  title: string;
  purpose: ImagePurpose;
  subject_class?: ImageSubjectClass;
  release_policy?: ImageReleasePolicy;
  intent?: string;
  product_id?: string | null;
  fabric_slug?: string | null;
  desired_variant_count?: number;
  constraints?: Json;
  due_date?: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type ImagePromptTemplateRow = {
  id: string;
  role: ImagePromptTemplateRole;
  version: number;
  model: string;
  system_prompt: string;
  params: Json;
  is_active: boolean;
  created_at: string;
};

export type ImagePromptTemplateInsert = {
  id?: string;
  role: ImagePromptTemplateRole;
  version: number;
  model: string;
  system_prompt: string;
  params?: Json;
  is_active?: boolean;
  created_at?: string;
};

export type ImageConceptRow = {
  id: string;
  brief_id: string;
  parent_concept_id: string | null;
  revision: number;
  status: ImageConceptStatus;
  title: string;
  concept: Json;
  render_spec: Json | null;
  render_spec_override: Json | null;
  director_template_id: string | null;
  engineer_template_id: string | null;
  claude_input_tokens: number;
  claude_output_tokens: number;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ImageConceptInsert = {
  id?: string;
  brief_id: string;
  parent_concept_id?: string | null;
  revision?: number;
  status?: ImageConceptStatus;
  title: string;
  concept: Json;
  render_spec?: Json | null;
  render_spec_override?: Json | null;
  director_template_id?: string | null;
  engineer_template_id?: string | null;
  claude_input_tokens?: number;
  claude_output_tokens?: number;
  approved_by?: string | null;
  approved_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ImageGenerationJobRow = {
  id: string;
  concept_id: string;
  status: ImageJobStatus;
  provider: string;
  provider_job_id: string | null;
  submitted_prompt: string;
  submitted_params: Json;
  requested_variant_count: number;
  seed: number | null;
  idempotency_key: string;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  lease_expires_at: string | null;
  error_category: ImageErrorCategory | null;
  error_code: string | null;
  error_message: string | null;
  estimated_cost_jpy: number;
  actual_cost_jpy: number | null;
  expires_at: string;
  submitted_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ImageGenerationJobInsert = {
  id?: string;
  concept_id: string;
  status?: ImageJobStatus;
  provider: string;
  provider_job_id?: string | null;
  submitted_prompt?: string;
  submitted_params?: Json;
  requested_variant_count?: number;
  seed?: number | null;
  idempotency_key: string;
  attempt_count?: number;
  max_attempts?: number;
  next_attempt_at?: string;
  claimed_by?: string | null;
  claimed_at?: string | null;
  lease_expires_at?: string | null;
  error_category?: ImageErrorCategory | null;
  error_code?: string | null;
  error_message?: string | null;
  estimated_cost_jpy?: number;
  actual_cost_jpy?: number | null;
  expires_at?: string;
  submitted_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ImageGenerationResultRow = {
  id: string;
  job_id: string;
  variant_index: number;
  source_url: string | null;
  source_url_expires_at: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  width: number | null;
  height: number | null;
  content_type: string | null;
  bytes: number | null;
  checksum: string | null;
  download_error: string | null;
  qa_verdict: ImageQaVerdict | null;
  qa_scores: Json | null;
  qa_issues: Json;
  alt_text_ja: string | null;
  alt_text_en: string | null;
  caption_draft: string | null;
  review_state: ImageReviewState;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
};

export type ImageGenerationResultInsert = {
  id?: string;
  job_id: string;
  variant_index: number;
  source_url?: string | null;
  source_url_expires_at?: string | null;
  storage_bucket?: string | null;
  storage_path?: string | null;
  width?: number | null;
  height?: number | null;
  content_type?: string | null;
  bytes?: number | null;
  checksum?: string | null;
  download_error?: string | null;
  qa_verdict?: ImageQaVerdict | null;
  qa_scores?: Json | null;
  qa_issues?: Json;
  alt_text_ja?: string | null;
  alt_text_en?: string | null;
  caption_draft?: string | null;
  review_state?: ImageReviewState;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ImageAssetRow = {
  id: string;
  result_id: string;
  purpose: ImagePurpose;
  subject_class: ImageSubjectClass;
  /** Always "production" — the DB rejects anything else. */
  release_policy: "production";
  public_bucket: string;
  public_path: string;
  public_url: string;
  alt_text_ja: string;
  alt_text_en: string;
  is_ai_generated: boolean;
  generation_provider: string;
  license_note: string;
  attached_product_id: string | null;
  attached_fabric_slug: string | null;
  attached_content_key: string | null;
  created_by: string;
  created_at: string;
};

export type ImageAssetInsert = {
  id?: string;
  result_id: string;
  purpose: ImagePurpose;
  subject_class: ImageSubjectClass;
  release_policy?: "production";
  public_bucket: string;
  public_path: string;
  public_url: string;
  alt_text_ja?: string;
  alt_text_en?: string;
  is_ai_generated?: boolean;
  generation_provider: string;
  license_note?: string;
  attached_product_id?: string | null;
  attached_fabric_slug?: string | null;
  attached_content_key?: string | null;
  created_by: string;
  created_at?: string;
};

export type ImageReviewAction =
  | "approve"
  | "reject"
  | "request_revision"
  | "publish"
  | "unpublish";

export type ImageReviewEventRow = {
  id: string;
  result_id: string;
  action: ImageReviewAction;
  from_state: ImageReviewState | null;
  to_state: ImageReviewState | null;
  actor: string;
  note: string;
  created_at: string;
};

export type ImageReviewEventInsert = {
  id?: string;
  result_id: string;
  action: ImageReviewAction;
  from_state?: ImageReviewState | null;
  to_state?: ImageReviewState | null;
  actor: string;
  note?: string;
  created_at?: string;
};

export type ImageProviderEventSource = "webhook" | "poll" | "submit";

export type ImageProviderEventRow = {
  id: string;
  job_id: string | null;
  provider: string;
  provider_event_id: string | null;
  source: ImageProviderEventSource;
  payload: Json;
  received_at: string;
};

export type ImageProviderEventInsert = {
  id?: string;
  job_id?: string | null;
  provider: string;
  provider_event_id?: string | null;
  source: ImageProviderEventSource;
  payload: Json;
  received_at?: string;
};

export type ImageCostKind = "claude" | "image_provider";

export type ImageCostLedgerRow = {
  id: string;
  job_id: string | null;
  kind: ImageCostKind;
  provider: string;
  amount_jpy: number;
  detail: Json;
  occurred_at: string;
};

export type ImageCostLedgerInsert = {
  id?: string;
  job_id?: string | null;
  kind: ImageCostKind;
  provider: string;
  amount_jpy: number;
  detail?: Json;
  occurred_at?: string;
};

export type IntegrationOutboxStatus = "pending" | "delivered" | "failed";

export type IntegrationOutboxRow = {
  id: string;
  event_type: string;
  payload: Json;
  status: IntegrationOutboxStatus;
  attempt_count: number;
  max_attempts: number;
  next_attempt_at: string;
  last_error: string | null;
  delivered_at: string | null;
  created_at: string;
};

export type IntegrationOutboxInsert = {
  id?: string;
  event_type: string;
  payload?: Json;
  status?: IntegrationOutboxStatus;
  attempt_count?: number;
  max_attempts?: number;
  next_attempt_at?: string;
  last_error?: string | null;
  delivered_at?: string | null;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      site_content: {
        Row: SiteContentRow;
        Insert: SiteContentInsert;
        Update: Partial<SiteContentInsert>;
        Relationships: [];
      };
      fabrics: {
        Row: FabricRow;
        Insert: FabricInsert;
        Update: Partial<FabricInsert>;
        Relationships: [];
      };
      products: {
        Row: ProductRow;
        Insert: ProductInsert;
        Update: Partial<ProductInsert>;
        Relationships: [];
      };
      product_variants: {
        Row: ProductVariantRow;
        Insert: Omit<ProductVariantRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<ProductVariantRow, "id" | "created_at">
        >;
        Relationships: [];
      };
      product_images: {
        Row: ProductImageRow;
        Insert: Omit<ProductImageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<
          Omit<ProductImageRow, "id" | "created_at">
        >;
        Relationships: [];
      };
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
        Relationships: [];
      };
      order_items: {
        Row: OrderItemRow;
        Insert: OrderItemInsert;
        Update: Partial<OrderItemInsert>;
        Relationships: [];
      };
      image_briefs: {
        Row: ImageBriefRow;
        Insert: ImageBriefInsert;
        Update: Partial<ImageBriefInsert>;
        Relationships: [];
      };
      image_prompt_templates: {
        Row: ImagePromptTemplateRow;
        Insert: ImagePromptTemplateInsert;
        Update: Partial<ImagePromptTemplateInsert>;
        Relationships: [];
      };
      image_concepts: {
        Row: ImageConceptRow;
        Insert: ImageConceptInsert;
        Update: Partial<ImageConceptInsert>;
        Relationships: [];
      };
      image_generation_jobs: {
        Row: ImageGenerationJobRow;
        Insert: ImageGenerationJobInsert;
        Update: Partial<ImageGenerationJobInsert>;
        Relationships: [];
      };
      image_generation_results: {
        Row: ImageGenerationResultRow;
        Insert: ImageGenerationResultInsert;
        Update: Partial<ImageGenerationResultInsert>;
        Relationships: [];
      };
      image_assets: {
        Row: ImageAssetRow;
        Insert: ImageAssetInsert;
        Update: Partial<ImageAssetInsert>;
        Relationships: [];
      };
      image_review_events: {
        Row: ImageReviewEventRow;
        Insert: ImageReviewEventInsert;
        Update: Partial<ImageReviewEventInsert>;
        Relationships: [];
      };
      image_provider_events: {
        Row: ImageProviderEventRow;
        Insert: ImageProviderEventInsert;
        Update: Partial<ImageProviderEventInsert>;
        Relationships: [];
      };
      image_cost_ledger: {
        Row: ImageCostLedgerRow;
        Insert: ImageCostLedgerInsert;
        Update: Partial<ImageCostLedgerInsert>;
        Relationships: [];
      };
      integration_outbox: {
        Row: IntegrationOutboxRow;
        Insert: IntegrationOutboxInsert;
        Update: Partial<IntegrationOutboxInsert>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      decrement_variant_stock: {
        Args: {
          p_product_id: string;
          p_size: string;
          p_quantity: number;
        };
        Returns: undefined;
      };
      claim_image_jobs: {
        Args: {
          p_worker_id: string;
          p_statuses: ImageJobStatus[];
          p_limit?: number;
          p_lease_seconds?: number;
        };
        Returns: ImageGenerationJobRow[];
      };
    };
    Enums: {
      order_status: OrderStatus;
      image_purpose: ImagePurpose;
      image_subject_class: ImageSubjectClass;
      image_release_policy: ImageReleasePolicy;
      image_job_status: ImageJobStatus;
      image_review_state: ImageReviewState;
      image_concept_status: ImageConceptStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

/** Product row joined with its primary image URL. */
export type ProductWithPrimaryImage = ProductRow & {
  primary_image_url: string | null;
};

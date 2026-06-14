import "server-only";

import { getSiteContent } from "@/lib/db/content/repository";
import type {
  ContactPageContent,
  LegalBusinessContent,
  PolicyPageContent,
} from "@/types/site-content";

export async function getLegalBusiness(): Promise<LegalBusinessContent> {
  return getSiteContent("legal");
}

export async function getContactContent(): Promise<ContactPageContent> {
  return getSiteContent("contact");
}

export async function getShippingContent(): Promise<PolicyPageContent> {
  return getSiteContent("shipping");
}

export async function getPolicyContent(
  key: "privacy" | "terms",
): Promise<PolicyPageContent> {
  return getSiteContent(key);
}

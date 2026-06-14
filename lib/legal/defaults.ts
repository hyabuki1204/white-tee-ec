import {
  CONTACT_INTRO,
  LEGAL_BUSINESS,
  SHIPPING_SECTIONS,
} from "@/lib/legal/content";
import {
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_TERMS_CONTENT,
} from "@/lib/legal/default-policies";
import type {
  ContactPageContent,
  LegalBusinessContent,
  PolicyPageContent,
} from "@/types/site-content";

export const DEFAULT_LEGAL_CONTENT: LegalBusinessContent = {
  operator: LEGAL_BUSINESS.operator,
  address: LEGAL_BUSINESS.address,
  email: LEGAL_BUSINESS.email,
  phone: LEGAL_BUSINESS.phone,
};

export const DEFAULT_CONTACT_CONTENT: ContactPageContent = {
  introLines: [CONTACT_INTRO[0], CONTACT_INTRO[1]],
  email: LEGAL_BUSINESS.email,
  hours: LEGAL_BUSINESS.phone,
};

export const DEFAULT_SHIPPING_CONTENT: PolicyPageContent = {
  pageTitle: "Shipping & Returns",
  sections: SHIPPING_SECTIONS.map((section) => ({
    title: section.title,
    body: section.body,
  })),
};

export {
  DEFAULT_PRIVACY_CONTENT,
  DEFAULT_TERMS_CONTENT,
} from "@/lib/legal/default-policies";

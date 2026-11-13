import { notFound } from "next/navigation";

/**
 * Any storefront URL that matches no other route. Throwing `notFound()` here
 * (instead of letting Next fall back to its bare default page) renders
 * `app/(store)/not-found.tsx` inside the store layout, with a 404 status.
 */
export default function UnmatchedStorePage() {
  notFound();
}

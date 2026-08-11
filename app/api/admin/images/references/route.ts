import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  createReferenceSet,
  listReferenceSets,
} from "@/lib/db/images/reference-repository";
import type { AdminImageReferenceSetInput } from "@/types/admin-image";
import type { ImagePurpose } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PURPOSES: readonly ImagePurpose[] = [
  "instagram_teaser",
  "ec_hero",
  "product_lp",
  "journal",
  "fabric",
];

function parseSetBody(body: Partial<AdminImageReferenceSetInput>): AdminImageReferenceSetInput {
  if (typeof body.name !== "string" || !body.name.trim()) {
    throw new Error("name is required.");
  }

  const purposes = Array.isArray(body.purposes)
    ? body.purposes.filter((value): value is ImagePurpose =>
        PURPOSES.includes(value as ImagePurpose),
      )
    : [];

  return {
    name: body.name.trim(),
    description: typeof body.description === "string" ? body.description : "",
    isDefault: Boolean(body.isDefault),
    purposes,
  };
}

export async function GET() {
  try {
    await requireAdminSession();

    return NextResponse.json({ sets: await listReferenceSets() });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to list reference sets.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = (await request.json()) as Partial<AdminImageReferenceSetInput>;
    const set = await createReferenceSet(parseSetBody(body));

    revalidatePath("/admin/images/references");

    return NextResponse.json({ set });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to create reference set.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

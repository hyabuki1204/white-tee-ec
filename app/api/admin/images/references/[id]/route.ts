import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  deleteReferenceSet,
  getReferenceSet,
  updateReferenceSet,
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const set = await getReferenceSet(id);

    if (!set) {
      return NextResponse.json({ error: "Not found." }, { status: 404 });
    }

    return NextResponse.json({ set });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to load reference set.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = (await request.json()) as Partial<AdminImageReferenceSetInput>;
    const set = await updateReferenceSet(id, parseSetBody(body));

    revalidatePath("/admin/images/references");
    revalidatePath(`/admin/images/references/${id}`);

    return NextResponse.json({ set });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to update reference set.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await deleteReferenceSet(id);

    revalidatePath("/admin/images/references");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to delete reference set.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

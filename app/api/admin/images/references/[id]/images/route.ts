import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import {
  addReferenceImage,
  removeReferenceImage,
} from "@/lib/db/images/reference-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AddBody = {
  url?: string;
  assetId?: string | null;
  note?: string;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = (await request.json()) as AddBody;

    if (typeof body.url !== "string" || !body.url.trim()) {
      return NextResponse.json({ error: "url is required." }, { status: 400 });
    }

    const image = await addReferenceImage({
      setId: id,
      url: body.url,
      assetId: body.assetId ?? null,
      note: body.note,
    });

    revalidatePath(`/admin/images/references/${id}`);
    revalidatePath("/admin/images/references");

    return NextResponse.json({ image });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to add reference image.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const { id: setId } = await params;
    const imageId = new URL(request.url).searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json(
        { error: "imageId query param is required." },
        { status: 400 },
      );
    }

    await removeReferenceImage(imageId);

    revalidatePath(`/admin/images/references/${setId}`);
    revalidatePath("/admin/images/references");

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to remove reference image.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}

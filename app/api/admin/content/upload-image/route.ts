import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { uploadAdminImageToStorage } from "@/lib/admin/image-upload";

const SITE_IMAGES_BUCKET = "site-images";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const url = await uploadAdminImageToStorage(SITE_IMAGES_BUCKET, file);

    return NextResponse.json({ url });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to upload image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

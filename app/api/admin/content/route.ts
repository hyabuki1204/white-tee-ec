import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { getAllSiteContent } from "@/lib/content/queries";

export async function GET() {
  try {
    await requireAdminSession();
    const content = await getAllSiteContent();
    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

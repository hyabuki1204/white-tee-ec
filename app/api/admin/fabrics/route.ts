import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { listAdminFabrics } from "@/lib/db/fabrics/admin-repository";

export async function GET() {
  try {
    await requireAdminSession();
    const fabrics = await listAdminFabrics();
    return NextResponse.json({ fabrics });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to list fabrics.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

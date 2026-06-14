import { NextResponse } from "next/server";
import {
  getAdminPassword,
  issueAdminSessionCookie,
} from "@/lib/admin/auth";

export async function POST(request: Request) {
  try {
    const adminPassword = getAdminPassword();

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin login is not configured. Set ADMIN_PASSWORD." },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { password?: string };

    if (!body.password || body.password !== adminPassword) {
      return NextResponse.json({ error: "Invalid password." }, { status: 401 });
    }

    await issueAdminSessionCookie();

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sign in.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

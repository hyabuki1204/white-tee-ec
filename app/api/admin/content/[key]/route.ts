import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { parseSiteContentInput } from "@/lib/admin/content-input";
import { upsertSiteContent } from "@/lib/content/mutations";
import type { SiteContentKey } from "@/types/site-content";

type RouteContext = {
  params: Promise<{ key: string }>;
};

const VALID_KEYS: SiteContentKey[] = ["home", "about", "stories"];

function isSiteContentKey(value: string): value is SiteContentKey {
  return VALID_KEYS.includes(value as SiteContentKey);
}

function revalidateContentPaths(key: SiteContentKey) {
  switch (key) {
    case "home":
      revalidatePath("/");
      break;
    case "about":
      revalidatePath("/about");
      break;
    case "stories":
      revalidatePath("/stories");
      break;
    default:
      break;
  }

  revalidatePath("/admin/content");
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();

    const { key } = await context.params;

    if (!isSiteContentKey(key)) {
      return NextResponse.json({ error: "Invalid content key." }, { status: 400 });
    }

    const body = await request.json();
    const parsed = parseSiteContentInput(key, body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const content = await upsertSiteContent(key, parsed.data);
    revalidateContentPaths(key);

    return NextResponse.json({ content });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to update content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { parseSiteContentInput } from "@/lib/admin/content-input";
import { upsertSiteContent } from "@/lib/content/mutations";
import type { SiteContentKey } from "@/types/site-content";

type RouteContext = {
  params: Promise<{ key: string }>;
};

const VALID_KEYS: SiteContentKey[] = [
  "home",
  "about",
  "stories",
  "legal",
  "contact",
  "shipping",
  "privacy",
  "terms",
  "seo",
];

function isSiteContentKey(value: string): value is SiteContentKey {
  return VALID_KEYS.includes(value as SiteContentKey);
}

function revalidateContentPaths(key: SiteContentKey) {
  switch (key) {
    case "home":
      revalidatePath("/");
      revalidatePath("/admin/content");
      break;
    case "about":
      revalidatePath("/about");
      revalidatePath("/admin/content");
      break;
    case "stories":
      revalidatePath("/stories");
      revalidatePath("/admin/content");
      break;
    case "legal":
      revalidatePath("/legal");
      revalidatePath("/admin/pages");
      break;
    case "contact":
      revalidatePath("/contact");
      revalidatePath("/admin/pages");
      break;
    case "shipping":
      revalidatePath("/shipping");
      revalidatePath("/admin/pages");
      break;
    case "privacy":
      revalidatePath("/privacy");
      revalidatePath("/admin/pages");
      break;
    case "terms":
      revalidatePath("/terms");
      revalidatePath("/admin/pages");
      break;
    case "seo":
      revalidatePath("/");
      revalidatePath("/admin/seo");
      break;
    default:
      break;
  }
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

import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { parseAdminFabricInput } from "@/lib/admin/fabric-input";
import {
  getAdminFabric,
  updateAdminFabric,
} from "@/lib/db/fabrics/admin-repository";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { slug } = await context.params;
    const fabric = await getAdminFabric(slug);

    if (!fabric) {
      return NextResponse.json({ error: "Fabric not found." }, { status: 404 });
    }

    return NextResponse.json({ fabric });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to fetch fabric.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = parseAdminFabricInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const fabric = await updateAdminFabric(slug, parsed.data);

    revalidatePath("/fabric");
    revalidatePath(`/fabric/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/fabrics");

    return NextResponse.json({ fabric });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to update fabric.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

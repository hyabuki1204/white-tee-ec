import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { parseAdminProductInput } from "@/lib/admin/product-input";
import { deleteProduct, updateProduct } from "@/lib/products/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    await requireAdminSession();

    const { id } = await context.params;
    const body = await request.json();
    const parsed = parseAdminProductInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const product = await updateProduct(id, parsed.data);

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${id}/edit`);

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to update product.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireAdminSession();

    const { id } = await context.params;
    const result = await deleteProduct(id);

    revalidatePath("/products");
    revalidatePath("/admin/products");

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to delete product.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

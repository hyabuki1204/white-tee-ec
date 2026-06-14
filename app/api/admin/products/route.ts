import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { AdminAuthError, requireAdminSession } from "@/lib/admin/auth";
import { parseAdminProductInput } from "@/lib/admin/product-input";
import { createProduct } from "@/lib/products/mutations";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const body = await request.json();
    const parsed = parseAdminProductInput(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const product = await createProduct(parsed.data);

    revalidatePath("/products");
    revalidatePath(`/products/${product.slug}`);
    revalidatePath("/admin/products");

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const message =
      error instanceof Error ? error.message : "Failed to create product.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

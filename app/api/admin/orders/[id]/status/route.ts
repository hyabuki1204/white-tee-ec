import { NextResponse } from "next/server";
import { isAdminOrderStatus } from "@/lib/admin/order-status-options";
import { sendShippingNotification } from "@/lib/email/send-shipping-notification";
import { getAdminOrderDetail } from "@/lib/orders/queries";
import { getOrderById, updateOrderStatus } from "@/lib/orders/mutations";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: string };

    if (!body.status || !isAdminOrderStatus(body.status)) {
      return NextResponse.json(
        { error: "Invalid status value." },
        { status: 400 },
      );
    }

    const existingOrder = await getOrderById(id);

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await updateOrderStatus(id, body.status);

    let emailResult: { sent: boolean; reason?: string } | null = null;

    if (body.status === "shipped" && existingOrder.status !== "shipped") {
      const detail = await getAdminOrderDetail(id);

      if (detail) {
        emailResult = await sendShippingNotification(detail);
      }
    }

    return NextResponse.json({
      ok: true,
      status: body.status,
      email: emailResult,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update status.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

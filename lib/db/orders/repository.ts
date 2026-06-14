import "server-only";

import { decrementStockForOrderItems } from "@/lib/db/products/stock-repository";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  buildOrderInsertPayload,
  buildOrderItemInsertPayloads,
  mapOrderRowToAdminListItem,
  mapOrderRowsToOrder,
} from "@/lib/db/orders/mapper";
import type { CreateOrderInput, Order } from "@/types/order";
import type { AdminOrderListItem } from "@/types/admin-order";
import type { OrderStatus } from "@/types/database";

/**
 * Create an order and its line items in Supabase.
 * Intended to be called from checkout completion or Stripe webhooks (admin client).
 */
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Cannot create order: Supabase is not configured. Set env vars and DATA_SOURCE=supabase.",
    );
  }

  if (input.items.length === 0) {
    throw new Error("Cannot create order: cart is empty.");
  }

  const supabase = createSupabaseAdminClient();
  const orderPayload = buildOrderInsertPayload(input);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert(orderPayload)
    .select("*")
    .single();

  if (orderError || !order) {
    throw new Error(
      `Failed to create order: ${orderError?.message ?? "Unknown error"}`,
    );
  }

  const itemPayloads = buildOrderItemInsertPayloads(order.id, input);

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .insert(itemPayloads)
    .select("*");

  if (itemsError || !items) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(
      `Failed to create order items: ${itemsError?.message ?? "Unknown error"}`,
    );
  }

  try {
    await decrementStockForOrderItems(input.items);
  } catch (stockError) {
    await supabase.from("orders").delete().eq("id", order.id);
    throw stockError;
  }

  return mapOrderRowsToOrder(order, items);
}

/**
 * Fetch an order by ID (admin / server use).
 * Useful for Stripe webhook idempotency checks later.
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError) {
    throw new Error(`Failed to fetch order: ${orderError.message}`);
  }

  if (!order) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError || !items) {
    throw new Error(
      `Failed to fetch order items: ${itemsError?.message ?? "Unknown error"}`,
    );
  }

  return mapOrderRowsToOrder(order, items);
}

/** Lookup order by Stripe Payment Intent ID (for webhook idempotency). */
export async function getOrderByStripePaymentIntentId(
  paymentIntentId: string,
): Promise<Order | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = createSupabaseAdminClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("stripe_payment_intent_id", paymentIntentId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch order by payment intent: ${error.message}`);
  }

  if (!order) {
    return null;
  }

  return getOrderById(order.id);
}

/** List all orders for admin (newest first). */
export async function listOrders(): Promise<AdminOrderListItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`);
  }

  return (data ?? []).map(mapOrderRowToAdminListItem);
}

/** Update order status (admin use, service role). */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<void> {
  if (!isSupabaseConfigured()) {
    throw new Error("Cannot update order: Supabase is not configured.");
  }

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) {
    if (error.message.includes("invalid input value for enum order_status")) {
      throw new Error(
        'Status "shipped" is not in the database yet. Run supabase/migrations/add-shipped-status.sql in Supabase SQL Editor.',
      );
    }

    throw new Error(`Failed to update order status: ${error.message}`);
  }
}

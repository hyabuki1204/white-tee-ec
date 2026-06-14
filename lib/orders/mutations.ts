import "server-only";

/**
 * Order mutation facade.
 * Stripe webhook / checkout will call through here.
 */
export {
  createOrder,
  getOrderById,
  getOrderByStripePaymentIntentId,
  updateOrderStatus,
} from "@/lib/db/orders/repository";

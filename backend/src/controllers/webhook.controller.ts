import { Request, Response } from "express";
import { Order } from "../models/order.model";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { env } from "../config/env";
import { verifyWebhookSignature } from "../lib/razorpay";

export async function handleRazorpayWebhook(
  req: Request,
  res: Response
): Promise<void> {
  const signature = req.headers["x-razorpay-signature"] as string;

  if (!signature) {
    res.status(400).json({ error: "Missing x-razorpay-signature header" });
    return;
  }

  const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);

  if (!verifyWebhookSignature(body, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
    console.error("Webhook signature verification failed");
    res.status(400).json({ error: "Invalid signature" });
    return;
  }

  const event = typeof req.body === "object" ? req.body : JSON.parse(req.body);

  switch (event.event) {
    case "payment.captured": {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;
      const razorpayPaymentId = paymentEntity.id;

      console.log(
        `[WEBHOOK] Payment captured for Razorpay order ${razorpayOrderId}: ₹${paymentEntity.amount / 100}`
      );

      const order = await Order.findOne({ razorpayOrderId });
      if (order && order.paymentStatus !== "paid") {
        order.razorpayPaymentId = razorpayPaymentId;
        order.paymentStatus = "paid";
        order.status = "confirmed";
        await order.save();

        for (const item of order.items) {
          if (item.variant) {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { "variants.$[v].stock": -item.quantity },
            }, {
              arrayFilters: [{ "v._id": item.variant }],
            });
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: -item.quantity },
            });
          }
        }

        await Cart.findOneAndDelete({ user: order.user });

        console.log(`[WEBHOOK] Order ${order._id} confirmed and stock decremented`);
      }
      break;
    }

    case "payment.failed": {
      const paymentEntity = event.payload.payment.entity;
      const razorpayOrderId = paymentEntity.order_id;

      console.log(`[WEBHOOK] Payment failed for Razorpay order ${razorpayOrderId}`);

      const order = await Order.findOne({ razorpayOrderId });
      if (order) {
        order.paymentStatus = "failed";
        await order.save();
      }
      break;
    }

    default:
      console.log(`[WEBHOOK] Unhandled event type: ${event.event}`);
  }

  res.json({ received: true });
}

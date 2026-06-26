import crypto from "crypto";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { Cart } from "../models/cart.model";
import { Order } from "../models/order.model";
import { razorpay } from "../lib/razorpay";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const SHIPPING_COSTS = {
  standard: 0,
  express: 999,
  overnight: 1999,
};

export const createRazorpayOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { shippingAddress, billingAddress, shippingMethod, notes } = req.body;

    const cart = await Cart.findOne({ user: req.userId }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest("Cart is empty");
    }

    let subtotal = 0;
    const orderItems = cart.items.map((item) => {
      const product = item.product as any;
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;

      return {
        product: product._id,
        variant: item.variant,
        name: product.name,
        image: product.images?.[0]?.url,
        quantity: item.quantity,
        price: item.price,
      };
    });

    const taxRate = 0.08;
    const tax = Math.round(subtotal * taxRate);
    const shippingCost = SHIPPING_COSTS[shippingMethod as keyof typeof SHIPPING_COSTS] || 0;
    const total = subtotal + tax + shippingCost;

    const order = await Order.create({
      user: req.userId,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      shippingMethod,
      razorpayOrderId: "",
      subtotal,
      tax,
      shippingCost,
      total,
      status: "pending",
      paymentStatus: "pending",
      notes,
    });

    const razorpayOrder = await razorpay.orders.create({
      amount: total,
      currency: "INR",
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: req.userId!,
      },
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    res.json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        orderId: order._id,
        amount: total,
        currency: "INR",
      },
    });
  }
);

export const verifyPayment = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      user: req.userId,
    });
    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    if (order.paymentStatus === "paid") {
      throw ApiError.badRequest("Order already confirmed");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      order.paymentStatus = "failed";
      await order.save();
      throw ApiError.badRequest("Payment verification failed");
    }

    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentStatus = "paid";
    order.status = "confirmed";
    await order.save();

    await Cart.findOneAndDelete({ user: req.userId });

    console.log(
      `[ORDER] Order ${orderId} confirmed. Payment: ${razorpayPaymentId}. Total: ₹${order.total / 100}`
    );

    const populatedOrder = await Order.findById(order._id)
      .populate("items.product", "name slug images")
      .lean();

    res.json({
      success: true,
      data: { order: populatedOrder },
    });
  }
);

export const getOrders = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("items.product", "name slug images")
        .lean(),
      Order.countDocuments({ user: req.userId }),
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }
);

export const getOrder = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const order = await Order.findOne({
      _id: id,
      user: req.userId,
    })
      .populate("items.product", "name slug images")
      .lean();

    if (!order) {
      throw ApiError.notFound("Order not found");
    }

    res.json({
      success: true,
      data: { order },
    });
  }
);

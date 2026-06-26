import mongoose, { Schema, Document } from "mongoose";
import { addressSchema, IAddress } from "./shared/address.schema";

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variant?: mongoose.Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  shippingMethod: "standard" | "express" | "overnight";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  subtotal: number;
  discounts: number;
  tax: number;
  shippingCost: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant: {
      type: Schema.Types.ObjectId,
    },
    name: { type: String, required: true },
    image: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    shippingMethod: {
      type: String,
      enum: ["standard", "express", "overnight"],
      default: "standard",
    },
    razorpayOrderId: {
      type: String,
      default: "",
    },
    razorpayPaymentId: { type: String },
    subtotal: { type: Number, required: true, min: 0 },
    discounts: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    trackingNumber: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ razorpayOrderId: 1 });
orderSchema.index({ razorpayPaymentId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

export const Order = mongoose.model<IOrder>("Order", orderSchema);

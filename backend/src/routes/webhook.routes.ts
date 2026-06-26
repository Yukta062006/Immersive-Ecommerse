import { Router, raw } from "express";
import { handleRazorpayWebhook } from "../controllers/webhook.controller";

const router = Router();

router.post(
  "/razorpay",
  raw({ type: "application/json" }),
  handleRazorpayWebhook
);

export default router;

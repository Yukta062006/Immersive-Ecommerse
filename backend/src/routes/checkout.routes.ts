import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  getOrders,
  getOrder,
} from "../controllers/checkout.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { checkoutLimiter } from "../middleware/rateLimit.middleware";
import {
  createCheckoutSchema,
  verifyPaymentSchema,
  orderIdSchema,
} from "../schemas/checkout.schema";

const router = Router();

router.use(authenticateJWT);
router.use(checkoutLimiter);

router.post("/create-order", validateRequest(createCheckoutSchema), createRazorpayOrder);
router.post("/verify", validateRequest(verifyPaymentSchema), verifyPayment);

export default router;

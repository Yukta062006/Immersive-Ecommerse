import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cart.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { cartLimiter } from "../middleware/rateLimit.middleware";
import {
  addToCartSchema,
  updateCartItemSchema,
  removeCartItemSchema,
} from "../schemas/cart.schema";

const router = Router();

router.use(authenticateJWT);
router.use(cartLimiter);

router.get("/", getCart);
router.post("/", validateRequest(addToCartSchema), addToCart);
router.patch("/:itemId", validateRequest(updateCartItemSchema), updateCartItem);
router.delete("/:itemId", validateRequest(removeCartItemSchema), removeCartItem);
router.delete("/", clearCart);

export default router;

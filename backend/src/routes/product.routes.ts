import { Router } from "express";
import {
  getProducts,
  getProduct,
  getRelatedProducts,
  getCategories,
  searchProducts,
} from "../controllers/product.controller";
import { validateRequest } from "../middleware/validate.middleware";
import { productQuerySchema, productIdSchema } from "../schemas/product.schema";

const router = Router();

router.get("/search", searchProducts);
router.get("/categories", getCategories);
router.get("/", validateRequest(productQuerySchema), getProducts);
router.get("/:id", validateRequest(productIdSchema), getProduct);
router.get("/:id/related", validateRequest(productIdSchema), getRelatedProducts);

export default router;

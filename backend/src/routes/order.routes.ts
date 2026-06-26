import { Router } from "express";
import { getOrders, getOrder } from "../controllers/checkout.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { orderIdSchema } from "../schemas/checkout.schema";

const router = Router();

router.use(authenticateJWT);

router.get("/", getOrders);
router.get("/:id", validateRequest(orderIdSchema), getOrder);

export default router;

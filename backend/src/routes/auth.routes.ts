import { Router } from "express";
import { signup, login, logout, refresh, getMe } from "../controllers/auth.controller";
import { authenticateJWT } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";
import { authLimiter, signupLimiter } from "../middleware/rateLimit.middleware";
import { signupSchema, loginSchema } from "../schemas/auth.schema";

const router = Router();

router.post("/signup", signupLimiter, validateRequest(signupSchema), signup);
router.post("/login", authLimiter, validateRequest(loginSchema), login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", authenticateJWT, getMe);

export default router;

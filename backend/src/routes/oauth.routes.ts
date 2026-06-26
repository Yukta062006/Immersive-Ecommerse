import { Router } from "express";
import {
  initiateGoogle,
  googleCallback,
  initiateGitHub,
  githubCallback,
} from "../controllers/oauth.controller";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.get("/google", initiateGoogle);
router.get("/google/callback", authLimiter, googleCallback);
router.get("/github", initiateGitHub);
router.get("/github/callback", authLimiter, githubCallback);

export default router;

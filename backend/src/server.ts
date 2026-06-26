import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectDB } from "./lib/mongoose";
import { generalLimiter } from "./middleware/rateLimit.middleware";
import { errorHandler } from "./middleware/errorHandler";

import authRoutes from "./routes/auth.routes";
import oauthRoutes from "./routes/oauth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import checkoutRoutes from "./routes/checkout.routes";
import orderRoutes from "./routes/order.routes";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/webhook", webhookRoutes);

app.use(express.json({ limit: "10mb" }));

app.use(generalLimiter);

// Ensure DB is connected before handling requests
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Only start listener when not in serverless (Vercel)
if (!process.env.VERCEL) {
  const port = env.PORT || 4000;
  connectDB().then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port} in ${env.NODE_ENV} mode`);
    });
  }).catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
}

export default app;

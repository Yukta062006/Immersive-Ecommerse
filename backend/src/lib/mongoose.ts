import mongoose from "mongoose";
import { env } from "../config/env";

// Use Google DNS for local environments with DNS resolution issues
if (!process.env.VERCEL) {
  try {
    const dns = require("dns");
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch {}
}

let isConnected = false;
let connectionPromise: Promise<void> | null = null;

export async function connectDB(): Promise<void> {
  if (isConnected) return;
  if (connectionPromise) return connectionPromise;

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI);
      isConnected = true;
      console.log(`MongoDB connected: ${conn.connection.host}`);

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("disconnected", () => {
        isConnected = false;
        connectionPromise = null;
        console.warn("MongoDB disconnected");
      });
    } catch (error) {
      connectionPromise = null;
      console.error("MongoDB connection failed:", error);
      throw error;
    }
  })();

  return connectionPromise;
}

export async function disconnectDB(): Promise<void> {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  connectionPromise = null;
  console.log("MongoDB disconnected");
}

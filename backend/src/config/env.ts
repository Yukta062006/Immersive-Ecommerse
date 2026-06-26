import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface EnvConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  RAZORPAY_WEBHOOK_SECRET: string;
  FRONTEND_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
}

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function getEnvOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `FATAL: Environment variable ${key} is required. Set it before starting the server.`
    );
  }
  return value;
}

const isProd = process.env.NODE_ENV === "production";

/**
 * Validate OAuth credential pairs in production mode.
 * If one credential in a pair is set but the other is missing, fail startup.
 */
function validateOAuthPairs(): void {
  if (!isProd) return;

  const pairs: Array<{ id: string; secret: string; provider: string }> = [
    { id: "GOOGLE_CLIENT_ID", secret: "GOOGLE_CLIENT_SECRET", provider: "Google" },
    { id: "GITHUB_CLIENT_ID", secret: "GITHUB_CLIENT_SECRET", provider: "GitHub" },
  ];

  for (const { id, secret, provider } of pairs) {
    const hasId = !!process.env[id]?.trim();
    const hasSecret = !!process.env[secret]?.trim();

    if (hasId && !hasSecret) {
      throw new Error(
        `FATAL: ${provider} OAuth is partially configured. ${id} is set but ${secret} is missing. ` +
        `Either provide both credentials or remove both.`
      );
    }
    if (!hasId && hasSecret) {
      throw new Error(
        `FATAL: ${provider} OAuth is partially configured. ${secret} is set but ${id} is missing. ` +
        `Either provide both credentials or remove both.`
      );
    }
  }
}

// Run production OAuth validation on module load
validateOAuthPairs();

export const env: EnvConfig = {
  PORT: parseInt(getEnv("PORT", "4000"), 10),
  NODE_ENV: getEnv("NODE_ENV", "development"),
  MONGODB_URI: getEnv("MONGODB_URI", "mongodb://localhost:27017/immersive-ecommerce"),
  JWT_SECRET: isProd ? getEnvOrThrow("JWT_SECRET") : getEnv("JWT_SECRET", "dev-jwt-secret-change-in-production"),
  JWT_REFRESH_SECRET: isProd ? getEnvOrThrow("JWT_REFRESH_SECRET") : getEnv("JWT_REFRESH_SECRET", "dev-refresh-secret-change-in-production"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d"),
  RAZORPAY_KEY_ID: isProd ? getEnvOrThrow("RAZORPAY_KEY_ID") : getEnv("RAZORPAY_KEY_ID", "rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: isProd ? getEnvOrThrow("RAZORPAY_KEY_SECRET") : getEnv("RAZORPAY_KEY_SECRET", "test_secret_placeholder"),
  RAZORPAY_WEBHOOK_SECRET: isProd ? getEnvOrThrow("RAZORPAY_WEBHOOK_SECRET") : getEnv("RAZORPAY_WEBHOOK_SECRET", "webhook_secret_placeholder"),
  FRONTEND_URL: getEnv("FRONTEND_URL", "http://localhost:3000"),
  GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", ""),
  GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", ""),
  GITHUB_CLIENT_ID: getEnv("GITHUB_CLIENT_ID", ""),
  GITHUB_CLIENT_SECRET: getEnv("GITHUB_CLIENT_SECRET", ""),
};

/**
 * Check if both client ID and secret are present and non-empty for a given OAuth provider.
 */
export function isOAuthConfigured(provider: "google" | "github"): boolean {
  switch (provider) {
    case "google":
      return !!env.GOOGLE_CLIENT_ID.trim() && !!env.GOOGLE_CLIENT_SECRET.trim();
    case "github":
      return !!env.GITHUB_CLIENT_ID.trim() && !!env.GITHUB_CLIENT_SECRET.trim();
    default:
      return false;
  }
}

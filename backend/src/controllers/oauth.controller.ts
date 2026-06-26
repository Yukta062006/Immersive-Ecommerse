import crypto from "crypto";
import { Request, Response } from "express";
import { env, isOAuthConfigured } from "../config/env";
import { User, OAUTH_NO_PASSWORD } from "../models/user.model";
import { signAccessToken, signRefreshToken } from "../utils/jwt";
import { asyncHandler } from "../utils/asyncHandler";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function getBackendBaseUrl(req: Request): string {
  return `${req.protocol}://${req.get("host")}`;
}

/**
 * Shared handler: find or create user from OAuth profile, issue tokens, redirect.
 */
async function handleOAuthUser(
  provider: string,
  providerId: string,
  email: string | null,
  name: string,
  res: Response
): Promise<void> {
  if (!email) {
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=email_required`);
    return;
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select("+lockUntil");

  if (user) {
    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=account_locked`);
      return;
    }

    // Link provider if not already linked (max 5 enforced by schema)
    const alreadyLinked = user.oauthProviders.some(
      (p) => p.provider === provider && p.providerId === providerId
    );
    if (!alreadyLinked && user.oauthProviders.length < 5) {
      user.oauthProviders.push({
        provider,
        providerId,
        linkedAt: new Date(),
      });
      await user.save();
    }

    // Issue tokens
    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.redirect(env.FRONTEND_URL);
  } else {
    // Create new user
    const newUser = await User.create({
      email: email.toLowerCase(),
      passwordHash: OAUTH_NO_PASSWORD,
      name,
      oauthProviders: [
        {
          provider,
          providerId,
          linkedAt: new Date(),
        },
      ],
      emailVerified: true,
    });

    const accessToken = signAccessToken(newUser._id.toString());
    const refreshToken = signRefreshToken(newUser._id.toString());

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(env.FRONTEND_URL);
  }
}

/**
 * GET /api/auth/google — Initiate Google OAuth flow
 */
export const initiateGoogle = asyncHandler(async (req: Request, res: Response) => {
  if (!isOAuthConfigured("google")) {
    res.status(503).json({ message: "Google OAuth is not configured" });
    return;
  }

  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000, // 5 minutes
    path: "/",
  });

  const backendBaseUrl = getBackendBaseUrl(req);
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${backendBaseUrl}/api/auth/google/callback`,
    scope: "email profile",
    state,
    response_type: "code",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/**
 * GET /api/auth/github — Initiate GitHub OAuth flow
 */
export const initiateGitHub = asyncHandler(async (req: Request, res: Response) => {
  if (!isOAuthConfigured("github")) {
    res.status(503).json({ message: "GitHub OAuth is not configured" });
    return;
  }

  const state = crypto.randomBytes(32).toString("hex");

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 5 * 60 * 1000,
    path: "/",
  });

  const backendBaseUrl = getBackendBaseUrl(req);
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${backendBaseUrl}/api/auth/github/callback`,
    scope: "user:email read:user",
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

/**
 * GET /api/auth/google/callback — Handle Google OAuth callback
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  const { state, code } = req.query;
  const storedState = req.cookies?.oauth_state;

  // Clear the state cookie
  res.clearCookie("oauth_state", { path: "/" });

  // Validate state
  if (!storedState || storedState !== state) {
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=security_validation_failed`);
    return;
  }

  // User denied consent
  if (!code) {
    res.redirect(`${env.FRONTEND_URL}/auth/login`);
    return;
  }

  try {
    // Exchange code for token
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${getBackendBaseUrl(req)}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!tokenResponse.ok) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string };

    // Fetch user profile
    const profileController = new AbortController();
    const profileTimeout = setTimeout(() => profileController.abort(), 10000);

    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: profileController.signal,
    });

    clearTimeout(profileTimeout);

    if (!profileResponse.ok) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
      return;
    }

    const profile = (await profileResponse.json()) as {
      id: string;
      email?: string;
      name?: string;
    };

    await handleOAuthUser(
      "google",
      profile.id,
      profile.email || null,
      profile.name || "Google User",
      res
    );
  } catch {
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
  }
});

/**
 * GET /api/auth/github/callback — Handle GitHub OAuth callback
 */
export const githubCallback = asyncHandler(async (req: Request, res: Response) => {
  const { state, code } = req.query;
  const storedState = req.cookies?.oauth_state;

  // Clear the state cookie
  res.clearCookie("oauth_state", { path: "/" });

  // Validate state
  if (!storedState || storedState !== state) {
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=security_validation_failed`);
    return;
  }

  // User denied consent
  if (!code) {
    res.redirect(`${env.FRONTEND_URL}/auth/login`);
    return;
  }

  try {
    // Exchange code for token
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code as string,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!tokenResponse.ok) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
      return;
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
      return;
    }

    // Fetch user profile
    const profileController = new AbortController();
    const profileTimeout = setTimeout(() => profileController.abort(), 10000);

    const profileResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "Immersive-Ecommerce-App",
      },
      signal: profileController.signal,
    });

    clearTimeout(profileTimeout);

    if (!profileResponse.ok) {
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
      return;
    }

    const profile = (await profileResponse.json()) as {
      id: number;
      name?: string;
      login: string;
      email?: string;
    };

    // Fetch primary verified email
    let email: string | null = profile.email || null;

    if (!email) {
      const emailController = new AbortController();
      const emailTimeout = setTimeout(() => emailController.abort(), 10000);

      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "Immersive-Ecommerce-App",
        },
        signal: emailController.signal,
      });

      clearTimeout(emailTimeout);

      if (emailResponse.ok) {
        const emails = (await emailResponse.json()) as Array<{
          email: string;
          primary: boolean;
          verified: boolean;
        }>;
        const primaryEmail = emails.find((e) => e.primary && e.verified);
        email = primaryEmail?.email || null;
      }
    }

    await handleOAuthUser(
      "github",
      profile.id.toString(),
      email,
      profile.name || profile.login,
      res
    );
  } catch {
    res.redirect(`${env.FRONTEND_URL}/auth/login?error=authentication_failed`);
  }
});

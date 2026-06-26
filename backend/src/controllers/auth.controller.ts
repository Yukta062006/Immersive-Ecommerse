import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { signAccessToken, signRefreshToken, verifyRefreshToken, blockToken, isTokenBlocked } from "../utils/jwt";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export const signup = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict("An account with this email already exists");
    }

    const user = await User.create({
      email,
      passwordHash: password,
      name,
    });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  }
);

export const login = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+passwordHash +loginAttempts +lockUntil");
    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    if (user.lockUntil && user.lockUntil > new Date()) {
      const waitMin = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw ApiError.tooManyRequests(
        `Account locked due to too many failed attempts. Try again in ${waitMin} minute${waitMin > 1 ? "s" : ""}.`
      );
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      await user.incLoginAttempts();
      throw ApiError.unauthorized("Invalid email or password");
    }

    user.lastLogin = new Date();
    await user.resetLoginAttempts();

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.cookie("accessToken", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  }
);

export const logout = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
        if (decoded?.exp) {
          blockToken(refreshToken, decoded.exp);
        }
      } catch {}
    }

    res.clearCookie("accessToken", COOKIE_OPTIONS);
    res.clearCookie("refreshToken", COOKIE_OPTIONS);

    res.json({
      success: true,
      data: { message: "Logged out successfully" },
    });
  }
);

export const refresh = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw ApiError.unauthorized("Refresh token not found");
    }

    let userId: string;
    try {
      userId = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized("Invalid or expired refresh token");
    }

    if (isTokenBlocked(refreshToken)) {
      throw ApiError.unauthorized("Refresh token has been revoked");
    }

    blockToken(refreshToken, (jwt.decode(refreshToken) as { exp: number }).exp);

    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    const newAccessToken = signAccessToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());

    res.cookie("accessToken", newAccessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", newRefreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  }
);

export const getMe = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        addresses: user.addresses,
        wishlist: user.wishlist,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  }
);

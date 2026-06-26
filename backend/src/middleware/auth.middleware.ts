import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { User, IUser } from "../models/user.model";
import { ApiError } from "../utils/ApiError";

export interface AuthRequest extends Request {
  user?: IUser;
  userId?: string;
}

export async function authenticateJWT(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw ApiError.unauthorized("Authentication required");
    }

    const userId = verifyAccessToken(token);

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw ApiError.unauthorized("User not found");
    }

    req.user = user;
    req.userId = userId;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(ApiError.unauthorized("Invalid or expired token"));
    }
  }
}

export function authorize(...roles: string[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (roles.length > 0 && !roles.includes(req.user.role)) {
      return next(ApiError.forbidden("Insufficient permissions"));
    }

    next();
  };
}

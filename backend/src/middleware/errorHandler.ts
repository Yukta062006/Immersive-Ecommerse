import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", err);

  if (err instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    };
    if (err.details) {
      response.error.details = err.details;
    }
    res.status(err.statusCode).json(response);
    return;
  }

  if (err.name === "ValidationError" && "errors" in err) {
    const mongooseErr = err as any;
    const details = Object.values(mongooseErr.errors).map((e: any) => ({
      field: e.path,
      reason: e.message,
    }));
    res.status(422).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Database validation failed",
        details,
      },
    });
    return;
  }

  if (err.name === "CastError" && "path" in err) {
    const castErr = err as any;
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_ID",
        message: `Invalid ${castErr.path}: ${castErr.value}`,
      },
    });
    return;
  }

  if (err.name === "MongoServerError" && (err as any).code === 11000) {
    const mongoErr = err as any;
    const field = Object.keys(mongoErr.keyPattern)[0];
    res.status(409).json({
      success: false,
      error: {
        code: "DUPLICATE_VALUE",
        message: `A value for '${field}' already exists`,
      },
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    },
  });
}

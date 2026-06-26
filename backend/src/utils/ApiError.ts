export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: Record<string, unknown>) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new ApiError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Access denied") {
    return new ApiError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new ApiError(404, "NOT_FOUND", message);
  }

  static conflict(message: string) {
    return new ApiError(409, "CONFLICT", message);
  }

  static validation(message: string, details?: Record<string, unknown>) {
    return new ApiError(422, "VALIDATION_ERROR", message, details);
  }

  static tooManyRequests(message = "Too many requests, please try again later") {
    return new ApiError(429, "RATE_LIMIT_EXCEEDED", message);
  }

  static internal(message = "Internal server error") {
    return new ApiError(500, "INTERNAL_ERROR", message);
  }
}

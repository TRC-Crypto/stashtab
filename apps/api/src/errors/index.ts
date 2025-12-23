/**
 * Typed API Error System
 *
 * Provides consistent error handling across the API with:
 * - Error codes for programmatic handling
 * - HTTP status code mapping
 * - Detailed error information for debugging
 */

/**
 * API Error codes
 */
export enum ErrorCode {
  // Authentication errors (401)
  AUTH_MISSING_TOKEN = 'AUTH_MISSING_TOKEN',
  AUTH_INVALID_TOKEN = 'AUTH_INVALID_TOKEN',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_NO_WALLET = 'AUTH_NO_WALLET',

  // Authorization errors (403)
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

  // Validation errors (400)
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Resource errors (404)
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Business logic errors (400/422)
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSFER_FAILED = 'TRANSFER_FAILED',
  WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED',
  DEPOSIT_FAILED = 'DEPOSIT_FAILED',
  SAFE_NOT_DEPLOYED = 'SAFE_NOT_DEPLOYED',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',

  // Server errors (500)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  RPC_ERROR = 'RPC_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

/**
 * Maps error codes to HTTP status codes
 */
const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // 401 Unauthorized
  [ErrorCode.AUTH_MISSING_TOKEN]: 401,
  [ErrorCode.AUTH_INVALID_TOKEN]: 401,
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCode.AUTH_NO_WALLET]: 401,

  // 403 Forbidden
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 403,

  // 400 Bad Request
  [ErrorCode.VALIDATION_FAILED]: 400,
  [ErrorCode.INVALID_ADDRESS]: 400,
  [ErrorCode.INVALID_AMOUNT]: 400,
  [ErrorCode.MISSING_REQUIRED_FIELD]: 400,

  // 404 Not Found
  [ErrorCode.USER_NOT_FOUND]: 404,
  [ErrorCode.ACCOUNT_NOT_FOUND]: 404,
  [ErrorCode.RESOURCE_NOT_FOUND]: 404,

  // 422 Unprocessable Entity (business logic)
  [ErrorCode.INSUFFICIENT_FUNDS]: 422,
  [ErrorCode.TRANSFER_FAILED]: 422,
  [ErrorCode.WITHDRAWAL_FAILED]: 422,
  [ErrorCode.DEPOSIT_FAILED]: 422,
  [ErrorCode.SAFE_NOT_DEPLOYED]: 422,

  // 429 Too Many Requests
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 429,

  // 500 Internal Server Error
  [ErrorCode.INTERNAL_ERROR]: 500,
  [ErrorCode.DATABASE_ERROR]: 500,
  [ErrorCode.RPC_ERROR]: 500,
  [ErrorCode.EXTERNAL_SERVICE_ERROR]: 500,
};

/**
 * Base API Error class
 */
export class APIError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = ERROR_STATUS_MAP[code];
    this.details = details;

    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, APIError);
    }
  }

  /**
   * Convert to JSON response format
   */
  toJSON(requestId?: string) {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details }),
      },
      ...(requestId && { requestId }),
    };
  }
}

// ============================================================================
// Specific Error Classes
// ============================================================================

/**
 * Authentication error
 */
export class AuthenticationError extends APIError {
  constructor(
    message = 'Authentication required',
    code: ErrorCode = ErrorCode.AUTH_INVALID_TOKEN,
    details?: Record<string, unknown>
  ) {
    super(code, message, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends APIError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(ErrorCode.VALIDATION_FAILED, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends APIError {
  constructor(
    resource: string,
    code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND,
    details?: Record<string, unknown>
  ) {
    super(code, `${resource} not found`, details);
    this.name = 'NotFoundError';
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends APIError {
  public readonly retryAfter: number;

  constructor(retryAfter: number, details?: Record<string, unknown>) {
    super(
      ErrorCode.RATE_LIMIT_EXCEEDED,
      `Rate limit exceeded. Try again in ${retryAfter} seconds`,
      details
    );
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

/**
 * Insufficient funds error
 */
export class InsufficientFundsError extends APIError {
  constructor(details?: { required?: string; available?: string }) {
    super(ErrorCode.INSUFFICIENT_FUNDS, 'Insufficient funds for this operation', details);
    this.name = 'InsufficientFundsError';
  }
}

/**
 * Database error
 */
export class DatabaseError extends APIError {
  constructor(message = 'Database operation failed', details?: Record<string, unknown>) {
    super(ErrorCode.DATABASE_ERROR, message, details);
    this.name = 'DatabaseError';
  }
}

/**
 * RPC/blockchain error
 */
export class RPCError extends APIError {
  constructor(message = 'Blockchain RPC call failed', details?: Record<string, unknown>) {
    super(ErrorCode.RPC_ERROR, message, details);
    this.name = 'RPCError';
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an error is an APIError
 */
export function isAPIError(error: unknown): error is APIError {
  return error instanceof APIError;
}

/**
 * Wrap unknown errors in APIError
 */
export function wrapError(error: unknown): APIError {
  if (isAPIError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new APIError(ErrorCode.INTERNAL_ERROR, error.message, {
      originalError: error.name,
    });
  }

  return new APIError(ErrorCode.INTERNAL_ERROR, 'An unexpected error occurred');
}


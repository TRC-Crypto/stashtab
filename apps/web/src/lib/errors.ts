/**
 * Custom error classes for better error handling
 */

export class StashtabError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'StashtabError';
  }
}

export class AuthenticationError extends StashtabError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_REQUIRED', 401);
    this.name = 'AuthenticationError';
  }
}

export class InsufficientBalanceError extends StashtabError {
  constructor(message = 'Insufficient balance') {
    super(message, 'INSUFFICIENT_BALANCE', 400);
    this.name = 'InsufficientBalanceError';
  }
}

export class TransactionError extends StashtabError {
  constructor(message = 'Transaction failed', public txHash?: string) {
    super(message, 'TX_FAILED', 500);
    this.name = 'TransactionError';
  }
}

export class NetworkError extends StashtabError {
  constructor(message = 'Network error') {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

/**
 * Parse API error response
 */
export function parseApiError(response: Response, data: any): StashtabError {
  const message = data?.message || data?.error || 'An error occurred';

  switch (response.status) {
    case 401:
      return new AuthenticationError(message);
    case 400:
      if (message.toLowerCase().includes('balance')) {
        return new InsufficientBalanceError(message);
      }
      return new StashtabError(message, 'BAD_REQUEST', 400);
    case 503:
      return new NetworkError(message);
    default:
      return new StashtabError(message, 'UNKNOWN_ERROR', response.status);
  }
}

/**
 * User-friendly error messages
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof StashtabError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Parse common blockchain errors
    const message = error.message.toLowerCase();

    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was cancelled';
    }

    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for gas';
    }

    if (message.includes('nonce')) {
      return 'Transaction nonce error. Please try again.';
    }

    if (message.includes('timeout') || message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }

    return error.message;
  }

  return 'An unexpected error occurred';
}


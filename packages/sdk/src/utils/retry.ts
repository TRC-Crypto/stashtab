/**
 * Retry Utilities
 *
 * Provides retry logic for failed operations with exponential backoff.
 * Useful for network requests, transaction submissions, and other operations
 * that may fail transiently.
 */

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  retryable?: (error: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'retryable' | 'onRetry'>> = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay for retry attempt with exponential backoff
 */
function calculateDelay(
  attempt: number,
  options: Required<Omit<RetryOptions, 'retryable' | 'onRetry'>>
): number {
  const delay = options.initialDelayMs * Math.pow(options.backoffMultiplier, attempt - 1);
  return Math.min(delay, options.maxDelayMs);
}

/**
 * Retry an async function with exponential backoff
 *
 * @param fn - Function to retry
 * @param options - Retry configuration
 * @returns Result of the function
 * @throws Last error if all attempts fail
 *
 * @example
 * ```typescript
 * const result = await retry(
 *   () => fetch('/api/data'),
 *   {
 *     maxAttempts: 5,
 *     retryable: (error) => error instanceof NetworkError
 *   }
 * );
 * ```
 */
export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const config = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is retryable
      if (config.retryable && !config.retryable(error)) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === config.maxAttempts) {
        break;
      }

      // Call onRetry callback
      if (config.onRetry) {
        config.onRetry(attempt, error);
      }

      // Calculate delay and wait
      const delay = calculateDelay(attempt, config);
      await sleep(delay);
    }
  }

  // All attempts failed
  throw lastError;
}

/**
 * Retry with custom retry condition
 *
 * @example
 * ```typescript
 * await retryIf(
 *   () => submitTransaction(tx),
 *   (error) => error.code === 'RPC_ERROR' || error.code === 'NETWORK_ERROR'
 * );
 * ```
 */
export async function retryIf<T>(
  fn: () => Promise<T>,
  condition: (error: unknown) => boolean,
  options: Omit<RetryOptions, 'retryable'> = {}
): Promise<T> {
  return retry(fn, {
    ...options,
    retryable: condition,
  });
}

/**
 * Retry with timeout
 *
 * @example
 * ```typescript
 * await retryWithTimeout(
 *   () => fetchSlowEndpoint(),
 *   { timeoutMs: 5000, maxAttempts: 3 }
 * );
 * ```
 */
export async function retryWithTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  options: RetryOptions = {}
): Promise<T> {
  return Promise.race([
    retry(fn, options),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}

/**
 * Common retryable error conditions
 */
export const RetryConditions = {
  /**
   * Retry on network errors
   */
  isNetworkError: (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('ETIMEDOUT')
      );
    }
    return false;
  },

  /**
   * Retry on RPC errors (common in blockchain operations)
   */
  isRpcError: (error: unknown): boolean => {
    if (error instanceof Error) {
      return (
        error.message.includes('RPC') ||
        error.message.includes('timeout') ||
        error.message.includes('rate limit')
      );
    }
    return false;
  },

  /**
   * Retry on 5xx server errors
   */
  isServerError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as { status: number }).status;
      return status >= 500 && status < 600;
    }
    return false;
  },

  /**
   * Retry on rate limit errors
   */
  isRateLimitError: (error: unknown): boolean => {
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code: string }).code === 'RATE_LIMIT_EXCEEDED';
    }
    if (error instanceof Error) {
      return error.message.includes('rate limit') || error.message.includes('429');
    }
    return false;
  },
};

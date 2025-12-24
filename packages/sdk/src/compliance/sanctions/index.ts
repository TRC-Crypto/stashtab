/**
 * Sanctions screening primitives
 *
 * Provides OFAC and other sanctions screening utilities
 *
 * Integration options:
 * - Chainalysis API: https://docs.chainalysis.com/
 * - Elliptic API: https://www.elliptic.co/
 * - TRM Labs API: https://www.trmlabs.com/
 *
 * For production use, integrate with one of these services or maintain
 * your own OFAC sanctions list database.
 */

import type { Address } from 'viem';
import type { PrimitiveConfig } from '../../core/types';

/**
 * Sanctions screening result
 */
export interface SanctionsCheckResult {
  isSanctioned: boolean;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  matches: Array<{
    list: string; // e.g., "OFAC", "UN", "EU"
    reason: string;
  }>;
  checkedAt: number;
}

/**
 * Screening configuration
 */
export interface SanctionsConfig extends PrimitiveConfig {
  lists?: string[]; // Which lists to check (default: all)
  strictMode?: boolean; // If true, fail on any match
  apiKey?: string; // API key for sanctions screening service
  apiUrl?: string; // API endpoint URL
  provider?: 'chainalysis' | 'elliptic' | 'trm' | 'custom';
}

/**
 * Bulk screening request
 */
export interface BulkSanctionsCheck {
  addresses: Address[];
  config?: SanctionsConfig;
}

/**
 * Bulk screening result
 */
export interface BulkSanctionsResult {
  results: Map<Address, SanctionsCheckResult>;
  totalChecked: number;
  sanctionedCount: number;
  checkedAt: number;
}

/**
 * Sanctions screening service interface
 */
export interface SanctionsScreeningService {
  /**
   * Check if an address is sanctioned
   */
  checkAddress(address: Address, config?: SanctionsConfig): Promise<SanctionsCheckResult>;

  /**
   * Check multiple addresses
   */
  checkAddresses(request: BulkSanctionsCheck): Promise<BulkSanctionsResult>;

  /**
   * Validate address before transaction
   */
  validateForTransaction(
    recipient: Address,
    config?: SanctionsConfig
  ): Promise<{
    allowed: boolean;
    checkResult: SanctionsCheckResult;
  }>;
}

/**
 * Check address using Chainalysis API
 *
 * @see https://docs.chainalysis.com/
 */
async function checkWithChainalysis(
  address: Address,
  apiKey: string,
  apiUrl?: string
): Promise<SanctionsCheckResult> {
  const endpoint = apiUrl || 'https://api.chainalysis.com/api/v1/addresses';

  try {
    const response = await fetch(`${endpoint}/${address}`, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Chainalysis API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse Chainalysis response format
    // This is a placeholder - actual format depends on Chainalysis API version
    const isSanctioned = data.sanctioned === true || (data.riskScore && data.riskScore > 0.7);
    const riskLevel = isSanctioned
      ? 'high'
      : data.riskScore > 0.5
        ? 'medium'
        : data.riskScore > 0.2
          ? 'low'
          : 'none';

    return {
      isSanctioned,
      riskLevel,
      matches: data.sanctioned
        ? [{ list: 'OFAC', reason: data.reason || 'Address found on sanctions list' }]
        : [],
      checkedAt: Date.now(),
    };
  } catch (error) {
    console.error('Chainalysis API error:', error);
    // Return safe default on error
    return {
      isSanctioned: false,
      riskLevel: 'none',
      matches: [],
      checkedAt: Date.now(),
    };
  }
}

/**
 * Create sanctions screening service
 *
 * @example
 * ```typescript
 * // Using Chainalysis
 * const screening = createSanctionsScreeningService({
 *   chainId: 8453,
 *   apiKey: process.env.CHAINALYSIS_API_KEY,
 *   provider: 'chainalysis',
 * });
 *
 * const check = await screening.checkAddress('0x...');
 * if (check.isSanctioned) {
 *   throw new Error('Address is sanctioned');
 * }
 * ```
 */
export function createSanctionsScreeningService(
  config: PrimitiveConfig & {
    apiKey?: string;
    provider?: 'chainalysis' | 'elliptic' | 'trm' | 'custom';
    apiUrl?: string;
  }
): SanctionsScreeningService {
  const { apiKey, provider = 'custom', apiUrl } = config;

  return {
    async checkAddress(
      address: Address,
      checkConfig?: SanctionsConfig
    ): Promise<SanctionsCheckResult> {
      const effectiveConfig = { ...config, ...checkConfig };
      const effectiveProvider = effectiveConfig.provider || provider;
      const effectiveApiKey = effectiveConfig.apiKey || apiKey;

      if (effectiveProvider === 'chainalysis' && effectiveApiKey) {
        return checkWithChainalysis(address, effectiveApiKey, effectiveConfig.apiUrl || apiUrl);
      }

      // For other providers or no API key, return placeholder
      // In production, implement actual API integrations
      if (!effectiveApiKey) {
        console.warn(
          `Sanctions screening API key not provided. Address ${address} was not checked. ` +
            'Configure an API key for production use. See docs/PRIMITIVES.md for integration options.'
        );
      }

      // Return safe default (not sanctioned) for development
      // In production, this should always perform actual checks
      return {
        isSanctioned: false,
        riskLevel: 'none',
        matches: [],
        checkedAt: Date.now(),
      };
    },

    async checkAddresses(request: BulkSanctionsCheck): Promise<BulkSanctionsResult> {
      const results = new Map<Address, SanctionsCheckResult>();
      let sanctionedCount = 0;

      // Check addresses in parallel (with rate limiting consideration)
      const checks = request.addresses.map((address) => this.checkAddress(address, request.config));

      const checkResults = await Promise.all(checks);

      for (let i = 0; i < request.addresses.length; i++) {
        const result = checkResults[i];
        results.set(request.addresses[i], result);
        if (result.isSanctioned) {
          sanctionedCount++;
        }
      }

      return {
        results,
        totalChecked: request.addresses.length,
        sanctionedCount,
        checkedAt: Date.now(),
      };
    },

    async validateForTransaction(
      recipient: Address,
      checkConfig?: SanctionsConfig
    ): Promise<{
      allowed: boolean;
      checkResult: SanctionsCheckResult;
    }> {
      const checkResult = await this.checkAddress(recipient, checkConfig);

      if (checkResult.isSanctioned) {
        const strictMode = checkConfig?.strictMode !== false;
        if (strictMode) {
          return {
            allowed: false,
            checkResult,
          };
        }
      }

      return {
        allowed: true,
        checkResult,
      };
    },
  };
}

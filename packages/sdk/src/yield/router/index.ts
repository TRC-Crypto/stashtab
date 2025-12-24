/**
 * Yield router and aggregator
 *
 * Provides multi-protocol yield optimization and routing
 */

import { getAddresses } from '@stashtab/config';
import type { Address } from 'viem';
import { AaveService } from '../../aave/AaveService';
import type { StashtabPublicClient } from '../../client';
import type { PrimitiveConfig } from '../../core/types';

/**
 * Yield protocol identifier
 */
export type YieldProtocol = 'aave' | 'morpho';

/**
 * Yield opportunity
 */
export interface YieldOpportunity {
  protocol: YieldProtocol;
  apy: number;
  apyFormatted: string;
  risk: 'low' | 'medium' | 'high';
  liquidity: bigint;
  minDeposit?: bigint;
  maxDeposit?: bigint;
  fees?: {
    deposit?: number;
    withdraw?: number;
    management?: number;
  };
  chainId: number;
  supported: boolean;
}

/**
 * Yield routing strategy
 */
export type YieldStrategy =
  | 'highest-apy' // Route to highest APY
  | 'lowest-risk' // Route to lowest risk
  | 'balanced' // Balance APY and risk
  | 'manual'; // Manual protocol selection

/**
 * Yield routing configuration
 */
export interface YieldRouterConfig extends PrimitiveConfig {
  strategy: YieldStrategy;
  preferredProtocols?: YieldProtocol[];
  riskTolerance?: 'low' | 'medium' | 'high';
  minAPY?: number;
  maxSlippage?: number;
}

/**
 * Yield routing recommendation
 */
export interface YieldRecommendation {
  recommendedProtocol: YieldProtocol;
  expectedAPY: number;
  alternatives: YieldOpportunity[];
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Yield router service interface
 */
export interface YieldRouterService {
  /**
   * Get all available yield opportunities
   */
  getOpportunities(asset: Address, publicClient: StashtabPublicClient): Promise<YieldOpportunity[]>;

  /**
   * Get yield routing recommendation
   */
  recommend(
    asset: Address,
    amount: bigint,
    config: YieldRouterConfig,
    publicClient: StashtabPublicClient
  ): Promise<YieldRecommendation>;

  /**
   * Compare protocols
   */
  compareProtocols(
    asset: Address,
    protocols: YieldProtocol[],
    publicClient: StashtabPublicClient
  ): Promise<YieldOpportunity[]>;
}

/**
 * Risk levels for protocols
 */
const PROTOCOL_RISK: Record<YieldProtocol, 'low' | 'medium' | 'high'> = {
  aave: 'low',
  morpho: 'medium',
};

/**
 * Get APY score (weighted by risk)
 */
function getAPYScore(apy: number, risk: 'low' | 'medium' | 'high'): number {
  const riskMultiplier = {
    low: 1.0,
    medium: 0.8,
    high: 0.5,
  };
  return apy * riskMultiplier[risk];
}

/**
 * Create yield router service
 */
export function createYieldRouter(config: YieldRouterConfig): YieldRouterService {
  const { chainId, strategy, preferredProtocols } = config;

  return {
    async getOpportunities(
      asset: Address,
      publicClient: StashtabPublicClient
    ): Promise<YieldOpportunity[]> {
      const opportunities: YieldOpportunity[] = [];

      // Check Aave availability
      if (!preferredProtocols || preferredProtocols.includes('aave')) {
        try {
          const aaveRisk = PROTOCOL_RISK.aave;
          const aaveService = new AaveService(publicClient, chainId);
          const yieldRate = await aaveService.getYieldRate();

          opportunities.push({
            protocol: 'aave',
            apy: yieldRate.apyPercent,
            apyFormatted: `${yieldRate.apyPercent.toFixed(2)}%`,
            risk: aaveRisk,
            liquidity: 0n, // Would need to query protocol for liquidity
            chainId,
            supported: true,
          });
        } catch (error) {
          // Aave not available or error
          console.warn('Aave not available:', error);
          opportunities.push({
            protocol: 'aave',
            apy: 0,
            apyFormatted: '0.00%',
            risk: PROTOCOL_RISK.aave,
            liquidity: 0n,
            chainId,
            supported: false,
          });
        }
      }

      // Check Morpho availability
      if (!preferredProtocols || preferredProtocols.includes('morpho')) {
        try {
          // Morpho requires market parameters - for now, check if contract exists
          const addresses = getAddresses(chainId);
          const morphoSupported = !!addresses.MORPHO_BLUE;

          if (morphoSupported) {
            // In production, would query actual Morpho markets and APY
            // For now, return placeholder
            opportunities.push({
              protocol: 'morpho',
              apy: 0, // Would fetch from Morpho markets
              apyFormatted: '0.00%',
              risk: PROTOCOL_RISK.morpho,
              liquidity: 0n,
              chainId,
              supported: true,
            });
          } else {
            opportunities.push({
              protocol: 'morpho',
              apy: 0,
              apyFormatted: '0.00%',
              risk: PROTOCOL_RISK.morpho,
              liquidity: 0n,
              chainId,
              supported: false,
            });
          }
        } catch (error) {
          opportunities.push({
            protocol: 'morpho',
            apy: 0,
            apyFormatted: '0.00%',
            risk: PROTOCOL_RISK.morpho,
            liquidity: 0n,
            chainId,
            supported: false,
          });
        }
      }

      return opportunities;
    },

    async recommend(
      asset: Address,
      amount: bigint,
      routerConfig: YieldRouterConfig,
      publicClient: StashtabPublicClient
    ): Promise<YieldRecommendation> {
      const opportunities = await this.getOpportunities(asset, publicClient);
      const supportedOpportunities = opportunities.filter((opp) => opp.supported);

      if (supportedOpportunities.length === 0) {
        throw new Error('No supported yield protocols available');
      }

      // Filter by minimum APY if specified
      const filteredOpportunities = routerConfig.minAPY
        ? supportedOpportunities.filter((opp) => opp.apy >= routerConfig.minAPY!)
        : supportedOpportunities;

      if (filteredOpportunities.length === 0) {
        throw new Error(`No protocols meet minimum APY requirement of ${routerConfig.minAPY}%`);
      }

      let recommended: YieldOpportunity;
      let reasoning: string;

      switch (strategy) {
        case 'highest-apy': {
          recommended = filteredOpportunities.reduce((best, current) =>
            current.apy > best.apy ? current : best
          );
          reasoning = `Selected ${recommended.protocol} with highest APY of ${recommended.apyFormatted}`;
          break;
        }

        case 'lowest-risk': {
          const riskOrder = { low: 1, medium: 2, high: 3 };
          recommended = filteredOpportunities.reduce((best, current) =>
            riskOrder[current.risk] < riskOrder[best.risk] ? current : best
          );
          reasoning = `Selected ${recommended.protocol} with lowest risk profile (${recommended.risk})`;
          break;
        }

        case 'balanced': {
          // Score by APY weighted by risk
          recommended = filteredOpportunities.reduce((best, current) => {
            const bestScore = getAPYScore(best.apy, best.risk);
            const currentScore = getAPYScore(current.apy, current.risk);
            return currentScore > bestScore ? current : best;
          });
          reasoning = `Selected ${recommended.protocol} with balanced APY (${recommended.apyFormatted}) and risk (${recommended.risk})`;
          break;
        }

        case 'manual': {
          // Use first preferred protocol or first available
          recommended = filteredOpportunities[0];
          reasoning = `Selected ${recommended.protocol} based on manual selection`;
          break;
        }

        default:
          throw new Error(`Unknown strategy: ${strategy}`);
      }

      // Filter out the recommended one from alternatives
      const alternatives = filteredOpportunities.filter(
        (opp) => opp.protocol !== recommended.protocol
      );

      return {
        recommendedProtocol: recommended.protocol,
        expectedAPY: recommended.apy,
        alternatives,
        reasoning,
        riskLevel: recommended.risk,
      };
    },

    async compareProtocols(
      asset: Address,
      protocols: YieldProtocol[],
      publicClient: StashtabPublicClient
    ): Promise<YieldOpportunity[]> {
      const allOpportunities = await this.getOpportunities(asset, publicClient);
      return allOpportunities.filter((opp) => protocols.includes(opp.protocol));
    },
  };
}

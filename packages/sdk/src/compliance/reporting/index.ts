/**
 * Compliance reporting primitives
 *
 * Provides transaction reporting and compliance event hooks
 */

import type { Address, Hash } from 'viem';
import type { PrimitiveConfig } from '../../core/types';

/**
 * Transaction type for reporting
 */
export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'yield-earned'
  | 'fiat-onramp'
  | 'fiat-offramp';

/**
 * Transaction record for compliance
 */
export interface ComplianceTransaction {
  txHash: Hash;
  from: Address;
  to: Address;
  amount: bigint;
  token: Address;
  type: TransactionType;
  timestamp: number;
  chainId: number;
  userId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Reporting event
 */
export interface ComplianceEvent {
  type: 'transaction' | 'user-action' | 'suspicious-activity' | 'threshold-exceeded';
  severity: 'low' | 'medium' | 'high' | 'critical';
  data: ComplianceTransaction | Record<string, unknown>;
  timestamp: number;
  userId?: string;
}

/**
 * Reporting configuration
 */
export interface ReportingConfig extends PrimitiveConfig {
  enabled: boolean;
  reportThreshold?: bigint; // Report transactions above this amount
  eventHooks?: {
    onTransaction?: (tx: ComplianceTransaction) => Promise<void>;
    onEvent?: (event: ComplianceEvent) => Promise<void>;
  };
  exportFormat?: 'json' | 'csv' | 'pdf';
}

/**
 * Reporting service interface
 */
export interface ComplianceReportingService {
  /**
   * Record a transaction for compliance
   */
  recordTransaction(tx: ComplianceTransaction): Promise<void>;

  /**
   * Emit a compliance event
   */
  emitEvent(event: ComplianceEvent): Promise<void>;

  /**
   * Generate transaction report
   */
  generateReport(options: {
    startDate: number;
    endDate: number;
    userId?: string;
    transactionTypes?: TransactionType[];
    format?: 'json' | 'csv' | 'pdf';
  }): Promise<string | Buffer>;

  /**
   * Get transaction history for compliance
   */
  getTransactionHistory(options: {
    userId?: string;
    startDate?: number;
    endDate?: number;
    limit?: number;
  }): Promise<ComplianceTransaction[]>;
}

/**
 * Create compliance reporting service
 */
export function createComplianceReportingService(
  _config: ReportingConfig
): ComplianceReportingService {
  // TODO: Implement compliance reporting with event hooks
  throw new Error('Compliance reporting service not yet implemented');
}

/**
 * @stashtab/ui
 *
 * React component library for Stashtab
 *
 * Drop-in components for adding onchain finance capabilities to any React app
 */

// Providers
export { StashtabProvider, useStashtabClient, type StashtabProviderProps } from './providers';

// Hooks
export {
  useAccount,
  useBalance,
  useYield,
  usePayments,
  type UseAccountResult,
  type UseBalanceResult,
  type UseYieldResult,
  type UsePaymentsResult,
} from './hooks';

// Components
export {
  AccountBalance,
  DepositButton,
  SendForm,
  YieldDisplay,
  type AccountBalanceProps,
  type DepositButtonProps,
  type SendFormProps,
  type YieldDisplayProps,
} from './components';

export interface ArbitrageOpportunity {
  id: string;
  tokenPair: string;
  tokenA: string;
  tokenB: string;
  exchangeA: string;
  exchangeB: string;
  priceA: number;
  priceB: number;
  priceDifference: number;
  potentialProfit: number;
  gasEstimate: number;
  netProfit: number;
  amount: number;
  timestamp: number;
  status: 'active' | 'executing' | 'completed' | 'failed';
  exchanges: string[];
  slippage?: number;
}

export interface TokenPrice {
  symbol: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
  exchanges: {
    [exchange: string]: number;
  };
}

export interface TradingConfig {
  selectedTokens: string[];
  selectedExchanges: string[];
  minProfitThreshold: number;
  maxTransactionAmount: number;
  slippageTolerance: number;
  gasStrategy: 'slow' | 'standard' | 'fast' | 'custom';
  customGasPrice?: number;
  autoExecute: boolean;
  maxDailyLoss: number;
}

export interface Portfolio {
  totalBalance: number;
  totalProfit: number;
  totalTrades: number;
  successRate: number;
  dailyPnL: number;
  weeklyPnL: number;
  monthlyPnL: number;
}

export interface Transaction {
  id: string;
  hash: string;
  type: 'arbitrage' | 'deposit' | 'withdrawal';
  tokenPair: string;
  amount: number;
  profit: number;
  gasUsed: number;
  gasCost: number;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  exchanges: string[];
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  blockExplorer: string;
  gasPrice: number;
  blockNumber: number;
}

export interface WalletState {
  address: string | null;
  balance: number;
  network: NetworkInfo | null;
  connected: boolean;
}

export default interface
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ArbitrageOpportunity, TradingConfig, Portfolio, Transaction, WalletState } from '../types';

interface AppState {
  // Theme
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Wallet
  wallet: WalletState;
  setWallet: (wallet: WalletState | ((prev: WalletState) => WalletState)) => void;
  isNetworkSwitching: boolean;
  setIsNetworkSwitching: (switching: boolean) => void;
  hasEverConnected: boolean;
  setHasEverConnected: (connected: boolean) => void;

  // Trading
  tradingConfig: TradingConfig;
  setTradingConfig: (config: Partial<TradingConfig>) => void;
  
  // Opportunities
  opportunities: ArbitrageOpportunity[];
  setOpportunities: (opportunities: ArbitrageOpportunity[]) => void;
  
  // Portfolio
  portfolio: Portfolio;
  setPortfolio: (portfolio: Portfolio) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  
  // Bot Status
  botActive: boolean;
  setBotActive: (active: boolean) => void;
  
  // Current view
  currentView: 'dashboard' | 'trading' | 'history' | 'settings';
  setCurrentView: (view: 'dashboard' | 'trading' | 'history' | 'settings') => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      // Wallet
      wallet: {
        address: null,
        balance: 0,
        network: null,
        connected: false,
      },
      setWallet: (wallet) => set((state) => {
        const newWallet = typeof wallet === 'function' ? wallet(state.wallet) : wallet;
        return { 
          wallet: newWallet,
          hasEverConnected: newWallet.connected || state.hasEverConnected
        };
      }),
      isNetworkSwitching: false,
      setIsNetworkSwitching: (switching) => set({ isNetworkSwitching: switching }),
      hasEverConnected: false,
      setHasEverConnected: (connected) => set({ hasEverConnected: connected }),

      // Trading
      tradingConfig: {
        selectedTokens: ['ETH', 'USDC', 'USDT', 'DAI'],
        selectedExchanges: ['Uniswap V2', 'Uniswap V3', 'SushiSwap'],
        minProfitThreshold: 0.5,
        maxTransactionAmount: 10,
        slippageTolerance: 0.5,
        gasStrategy: 'standard',
        autoExecute: false,
        maxDailyLoss: 100,
      },
      setTradingConfig: (config) => set((state) => ({
        tradingConfig: { ...state.tradingConfig, ...config }
      })),

      // Opportunities
      opportunities: [],
      setOpportunities: (opportunities) => set({ opportunities }),

      // Portfolio
      portfolio: {
        totalBalance: 0,
        totalProfit: 0,
        totalTrades: 0,
        successRate: 0,
        dailyPnL: 0,
        weeklyPnL: 0,
        monthlyPnL: 0,
      },
      setPortfolio: (portfolio) => set({ portfolio }),

      // Transactions
      transactions: [],
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),

      // Bot Status
      botActive: false,
      setBotActive: (active) => set({ botActive: active }),

      // Current view
      currentView: 'dashboard',
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'flasharb-storage',
      partialize: (state) => ({
        isDarkMode: state.isDarkMode,
        hasEverConnected: state.hasEverConnected,
        currentView: state.currentView,
        tradingConfig: state.tradingConfig,
      }),
    }
  )
);
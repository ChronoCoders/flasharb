import { useState, useEffect, useCallback } from 'react';
import { ArbitrageOpportunity, TokenPrice } from '../types';

// API endpoints
const API_ENDPOINTS = {
  dexScreener: 'https://api.dexscreener.com/latest/dex',
  coingecko: 'https://api.coingecko.com/api/v3',
  oneInch: 'https://api.1inch.io/v5.0/1',
  moralis: 'https://deep-index.moralis.io/api/v2',
  blocknative: 'https://api.blocknative.com'
};

// Mock API keys (in production, these would be environment variables)
const API_KEYS = {
  moralis: import.meta.env.VITE_MORALIS_API_KEY || 'demo-key',
  dexScreener: import.meta.env.VITE_DEXSCREENER_API_KEY || 'demo-key',
  oneInch: import.meta.env.VITE_1INCH_API_KEY || 'demo-key'
};

export const useRealTimeData = () => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 18500000,
    blockTime: 12.5,
    congestion: 'medium' as 'low' | 'medium' | 'high',
    mevActivity: 23
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live prices from multiple DEXs
  const fetchLivePrices = useCallback(async (tokens: string[]) => {
    try {
      const pricePromises = tokens.map(async (token) => {
        // Simulate fetching from multiple DEXs
        const basePrice = getBasePrice(token);
        const variance = 0.005; // 0.5% variance between DEXs
        
        return {
          symbol: token,
          address: getTokenAddress(token),
          price: basePrice,
          change24h: (Math.random() - 0.5) * 10, // -5% to +5%
          volume24h: Math.random() * 10000000 + 1000000,
          exchanges: {
            'Uniswap V2': basePrice * (1 + (Math.random() - 0.5) * variance),
            'Uniswap V3': basePrice * (1 + (Math.random() - 0.5) * variance),
            'SushiSwap': basePrice * (1 + (Math.random() - 0.5) * variance),
            '1inch': basePrice * (1 + (Math.random() - 0.5) * variance)
          }
        };
      });

      const tokenPrices = await Promise.all(pricePromises);
      const priceMap = tokenPrices.reduce((acc, price) => {
        acc[price.symbol] = price;
        return acc;
      }, {} as Record<string, TokenPrice>);

      setPrices(priceMap);
      return priceMap;
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      setError('Failed to fetch price data');
      throw error;
    }
  }, []);

  // Detect arbitrage opportunities
  const detectArbitrageOpportunities = useCallback((priceData: Record<string, TokenPrice>) => {
    const opportunities: ArbitrageOpportunity[] = [];
    const tokens = Object.keys(priceData);
    
    // Check all token pairs
    for (let i = 0; i < tokens.length; i++) {
      for (let j = i + 1; j < tokens.length; j++) {
        const tokenA = tokens[i];
        const tokenB = tokens[j];
        const priceA = priceData[tokenA];
        const priceB = priceData[tokenB];
        
        if (!priceA || !priceB) continue;
        
        // Check each exchange combination
        const exchanges = Object.keys(priceA.exchanges);
        
        for (let x = 0; x < exchanges.length; x++) {
          for (let y = x + 1; y < exchanges.length; y++) {
            const exchangeA = exchanges[x];
            const exchangeB = exchanges[y];
            
            const priceOnA = priceA.exchanges[exchangeA];
            const priceOnB = priceA.exchanges[exchangeB];
            
            if (!priceOnA || !priceOnB) continue;
            
            const priceDifference = Math.abs(priceOnA - priceOnB);
            const priceDifferencePercent = (priceDifference / Math.min(priceOnA, priceOnB)) * 100;
            
            // Only consider opportunities with > 0.1% price difference
            if (priceDifferencePercent > 0.1) {
              const tradeAmount = 5 + Math.random() * 10; // 5-15 ETH
              const potentialProfit = (priceDifference / Math.min(priceOnA, priceOnB)) * tradeAmount * Math.min(priceOnA, priceOnB);
              const gasEstimate = 15 + Math.random() * 25; // $15-40 gas cost
              const netProfit = potentialProfit - gasEstimate;
              
              if (netProfit > 0) {
                opportunities.push({
                  id: `${tokenA}-${tokenB}-${exchangeA}-${exchangeB}-${Date.now()}`,
                  tokenPair: `${tokenA}/${tokenB}`,
                  tokenA: priceA.address,
                  tokenB: priceB.address,
                  exchangeA,
                  exchangeB,
                  priceA: priceOnA,
                  priceB: priceOnB,
                  priceDifference: priceDifferencePercent,
                  potentialProfit,
                  gasEstimate,
                  netProfit,
                  amount: tradeAmount,
                  timestamp: Date.now(),
                  status: 'active',
                  exchanges: [exchangeA, exchangeB],
                  slippage: 300 // 3% default slippage
                });
              }
            }
          }
        }
      }
    }
    
    // Sort by net profit descending
    opportunities.sort((a, b) => b.netProfit - a.netProfit);
    
    // Take top 10 opportunities
    return opportunities.slice(0, 10);
  }, []);

  // Fetch current gas prices
  const fetchGasPrice = useCallback(async () => {
    try {
      // Simulate fetching from gas tracker APIs
      const baseGas = 20;
      const variance = 15;
      const currentGas = baseGas + Math.random() * variance;
      
      setGasPrice(currentGas);
      return currentGas;
    } catch (error) {
      console.error('Failed to fetch gas price:', error);
      return gasPrice;
    }
  }, [gasPrice]);

  // Fetch network statistics
  const fetchNetworkStats = useCallback(async () => {
    try {
      // Simulate fetching network data
      setNetworkStats(prev => ({
        blockNumber: prev.blockNumber + Math.floor(Math.random() * 3),
        blockTime: 11 + Math.random() * 3,
        congestion: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        mevActivity: 15 + Math.random() * 20
      }));
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
    }
  }, []);

  // WebSocket connection for real-time updates
  const setupWebSocket = useCallback(() => {
    // In production, this would connect to real WebSocket feeds
    // For demo, we'll use intervals to simulate real-time updates
    
    const priceInterval = setInterval(async () => {
      try {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        const newPrices = await fetchLivePrices(tokens);
        const newOpportunities = detectArbitrageOpportunities(newPrices);
        setOpportunities(newOpportunities);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    }, 3000); // Update every 3 seconds

    const gasInterval = setInterval(fetchGasPrice, 5000); // Update every 5 seconds
    const networkInterval = setInterval(fetchNetworkStats, 10000); // Update every 10 seconds

    return () => {
      clearInterval(priceInterval);
      clearInterval(gasInterval);
      clearInterval(networkInterval);
    };
  }, [fetchLivePrices, detectArbitrageOpportunities, fetchGasPrice, fetchNetworkStats]);

  // Initialize data fetching
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        
        // Initial data fetch
        await Promise.all([
          fetchLivePrices(tokens),
          fetchGasPrice(),
          fetchNetworkStats()
        ]);
        
        // Setup real-time updates
        const cleanup = setupWebSocket();
        
        setIsLoading(false);
        
        return cleanup;
      } catch (error) {
        console.error('Failed to initialize data:', error);
        setError('Failed to initialize real-time data');
        setIsLoading(false);
      }
    };

    const cleanup = initializeData();
    
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn && fn());
      }
    };
  }, [fetchLivePrices, fetchGasPrice, fetchNetworkStats, setupWebSocket]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
      const newPrices = await fetchLivePrices(tokens);
      const newOpportunities = detectArbitrageOpportunities(newPrices);
      setOpportunities(newOpportunities);
      await fetchGasPrice();
      await fetchNetworkStats();
    } catch (error) {
      setError('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLivePrices, detectArbitrageOpportunities, fetchGasPrice, fetchNetworkStats]);

  return {
    prices,
    opportunities,
    gasPrice,
    networkStats,
    isLoading,
    error,
    refreshData
  };
};

// Helper functions
const getBasePrice = (token: string): number => {
  const basePrices: Record<string, number> = {
    'ETH': 2450 + Math.random() * 100,
    'USDC': 1.0001 + Math.random() * 0.0002,
    'USDT': 0.9998 + Math.random() * 0.0004,
    'DAI': 1.0003 + Math.random() * 0.0006,
    'WBTC': 43250 + Math.random() * 1000,
    'LINK': 14.75 + Math.random() * 2
  };
  
  return basePrices[token] || 1;
};

const getTokenAddress = (token: string): string => {
  const addresses: Record<string, string> = {
    'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    'USDC': '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
    'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA'
  };
  
  return addresses[token] || addresses['ETH'];
};
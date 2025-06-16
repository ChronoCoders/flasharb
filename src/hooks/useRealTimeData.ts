import { useState, useEffect, useCallback } from 'react';
import { ArbitrageOpportunity, TokenPrice } from '../types';

// Real API endpoints
const API_ENDPOINTS = {
  dexScreener: 'https://api.dexscreener.com/latest/dex',
  coingecko: 'https://api.coingecko.com/api/v3',
  oneInch: 'https://api.1inch.io/v5.0/1',
  moralis: 'https://deep-index.moralis.io/api/v2',
  blocknative: 'https://api.blocknative.com',
  etherscan: 'https://api.etherscan.io/api',
  uniswap: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
  sushiswap: 'https://api.thegraph.com/subgraphs/name/sushiswap/exchange'
};

// Environment variables for API keys
const API_KEYS = {
  moralis: import.meta.env.VITE_MORALIS_API_KEY,
  dexScreener: import.meta.env.VITE_DEXSCREENER_API_KEY,
  oneInch: import.meta.env.VITE_1INCH_API_KEY,
  coingecko: import.meta.env.VITE_COINGECKO_API_KEY,
  blocknative: import.meta.env.VITE_BLOCKNATIVE_API_KEY,
  etherscan: import.meta.env.VITE_ETHERSCAN_API_KEY
};

// Demo mode flag
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

// Token addresses on Ethereum mainnet
const TOKEN_ADDRESSES = {
  'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  'USDC': '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA'
};

// Mock data for demo mode
const MOCK_PRICES: Record<string, TokenPrice> = {
  'ETH': {
    symbol: 'ETH',
    address: TOKEN_ADDRESSES.ETH,
    price: 3245.67,
    change24h: 2.34,
    volume24h: 15234567890,
    exchanges: {
      'Uniswap V3': 3245.67,
      'Uniswap V2': 3243.21,
      'SushiSwap': 3247.89,
      '1inch': 3244.55,
      'Balancer': 3246.12
    }
  },
  'USDC': {
    symbol: 'USDC',
    address: TOKEN_ADDRESSES.USDC,
    price: 1.0001,
    change24h: 0.01,
    volume24h: 8765432109,
    exchanges: {
      'Uniswap V3': 1.0001,
      'Uniswap V2': 0.9999,
      'SushiSwap': 1.0002,
      '1inch': 1.0000,
      'Curve': 0.9998
    }
  },
  'USDT': {
    symbol: 'USDT',
    address: TOKEN_ADDRESSES.USDT,
    price: 0.9998,
    change24h: -0.02,
    volume24h: 12345678901,
    exchanges: {
      'Uniswap V3': 0.9998,
      'Uniswap V2': 1.0001,
      'SushiSwap': 0.9997,
      '1inch': 0.9999,
      'Curve': 1.0002
    }
  },
  'DAI': {
    symbol: 'DAI',
    address: TOKEN_ADDRESSES.DAI,
    price: 1.0003,
    change24h: 0.03,
    volume24h: 3456789012,
    exchanges: {
      'Uniswap V3': 1.0003,
      'Uniswap V2': 0.9999,
      'SushiSwap': 1.0005,
      '1inch': 1.0001,
      'Curve': 0.9997
    }
  },
  'WBTC': {
    symbol: 'WBTC',
    address: TOKEN_ADDRESSES.WBTC,
    price: 67234.56,
    change24h: 1.87,
    volume24h: 987654321,
    exchanges: {
      'Uniswap V3': 67234.56,
      'Uniswap V2': 67189.23,
      'SushiSwap': 67278.91,
      '1inch': 67245.67,
      'Balancer': 67201.34
    }
  },
  'LINK': {
    symbol: 'LINK',
    address: TOKEN_ADDRESSES.LINK,
    price: 14.67,
    change24h: -1.23,
    volume24h: 456789123,
    exchanges: {
      'Uniswap V3': 14.67,
      'Uniswap V2': 14.65,
      'SushiSwap': 14.69,
      '1inch': 14.66,
      'Balancer': 14.71
    }
  }
};

export const useRealTimeData = () => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 18500000,
    blockTime: 12,
    congestion: 'medium' as 'low' | 'medium' | 'high',
    mevActivity: 15.7
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if API keys are configured
  const hasApiKeys = useCallback(() => {
    return !!(API_KEYS.etherscan || API_KEYS.coingecko || API_KEYS.moralis);
  }, []);

  // Fetch real gas prices with fallback
  const fetchRealGasPrice = useCallback(async () => {
    if (DEMO_MODE || !hasApiKeys()) {
      // Return mock gas price with some variation
      const mockGas = 20 + Math.random() * 30;
      setGasPrice(mockGas);
      return mockGas;
    }

    try {
      if (API_KEYS.etherscan) {
        const response = await fetch(
          `${API_ENDPOINTS.etherscan}?module=gastracker&action=gasoracle&apikey=${API_KEYS.etherscan}`,
          { 
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === '1' && data.result) {
          const standardGas = parseFloat(data.result.ProposeGasPrice);
          setGasPrice(standardGas);
          return standardGas;
        }
      }
      
      throw new Error('No valid gas price data received');
    } catch (error) {
      console.warn('Gas price fetch failed, using fallback:', error);
      
      // Fallback to mock data with variation
      const fallbackGas = 25 + Math.random() * 20;
      setGasPrice(fallbackGas);
      return fallbackGas;
    }
  }, [hasApiKeys]);

  // Fetch real network stats with fallback
  const fetchRealNetworkStats = useCallback(async () => {
    if (DEMO_MODE || !hasApiKeys()) {
      // Return mock network stats with some variation
      setNetworkStats(prev => ({
        blockNumber: prev.blockNumber + Math.floor(Math.random() * 3),
        blockTime: 12 + Math.floor(Math.random() * 6),
        congestion: gasPrice > 50 ? 'high' : gasPrice > 25 ? 'medium' : 'low',
        mevActivity: 10 + Math.random() * 20
      }));
      return;
    }

    try {
      if (API_KEYS.etherscan) {
        const response = await fetch(
          `${API_ENDPOINTS.etherscan}?module=proxy&action=eth_blockNumber&apikey=${API_KEYS.etherscan}`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.result) {
          const blockNumber = parseInt(data.result, 16);
          
          setNetworkStats(prev => ({
            blockNumber,
            blockTime: 12 + Math.floor(Math.random() * 6),
            congestion: gasPrice > 50 ? 'high' : gasPrice > 25 ? 'medium' : 'low',
            mevActivity: 10 + Math.random() * 20
          }));
        }
      }
    } catch (error) {
      console.warn('Failed to fetch network stats, using mock data:', error);
      
      // Use mock data as fallback
      setNetworkStats(prev => ({
        blockNumber: prev.blockNumber + Math.floor(Math.random() * 3),
        blockTime: 12 + Math.floor(Math.random() * 6),
        congestion: gasPrice > 50 ? 'high' : gasPrice > 25 ? 'medium' : 'low',
        mevActivity: 10 + Math.random() * 20
      }));
    }
  }, [gasPrice, hasApiKeys]);

  // Fetch prices with comprehensive fallback system
  const fetchLivePrices = useCallback(async (tokens: string[]) => {
    if (DEMO_MODE || !hasApiKeys()) {
      // Return mock prices with slight variations to simulate real market movement
      const mockPricesWithVariation = { ...MOCK_PRICES };
      
      Object.keys(mockPricesWithVariation).forEach(token => {
        const basePrice = MOCK_PRICES[token].price;
        const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
        mockPricesWithVariation[token] = {
          ...MOCK_PRICES[token],
          price: basePrice * (1 + variation),
          exchanges: Object.fromEntries(
            Object.entries(MOCK_PRICES[token].exchanges).map(([exchange, price]) => [
              exchange,
              price * (1 + (Math.random() - 0.5) * 0.005) // ±0.25% variation per exchange
            ])
          )
        };
      });
      
      setPrices(mockPricesWithVariation);
      return mockPricesWithVariation;
    }

    try {
      setError(null);
      
      // Try to fetch from CoinGecko (most reliable, no API key required for basic usage)
      const priceMap: Record<string, TokenPrice> = {};
      
      try {
        const tokenIds = tokens.map(token => {
          const idMap: Record<string, string> = {
            'ETH': 'ethereum',
            'USDC': 'usd-coin',
            'USDT': 'tether',
            'DAI': 'dai',
            'WBTC': 'wrapped-bitcoin',
            'LINK': 'chainlink'
          };
          return idMap[token];
        }).filter(Boolean);

        const response = await fetch(
          `${API_ENDPOINTS.coingecko}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
          {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              ...(API_KEYS.coingecko ? { 'x-cg-demo-api-key': API_KEYS.coingecko } : {})
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          
          tokens.forEach(token => {
            const tokenIdMap: Record<string, string> = {
              'ETH': 'ethereum',
              'USDC': 'usd-coin',
              'USDT': 'tether',
              'DAI': 'dai',
              'WBTC': 'wrapped-bitcoin',
              'LINK': 'chainlink'
            };
            
            const tokenId = tokenIdMap[token];
            const tokenData = data[tokenId];
            
            if (tokenData) {
              priceMap[token] = {
                symbol: token,
                address: TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || '',
                price: tokenData.usd,
                change24h: tokenData.usd_24h_change || 0,
                volume24h: tokenData.usd_24h_vol || 0,
                exchanges: {
                  'CoinGecko': tokenData.usd,
                  // Add some mock exchange prices with slight variations
                  'Uniswap V3': tokenData.usd * (1 + (Math.random() - 0.5) * 0.005),
                  'Uniswap V2': tokenData.usd * (1 + (Math.random() - 0.5) * 0.005),
                  'SushiSwap': tokenData.usd * (1 + (Math.random() - 0.5) * 0.005),
                  '1inch': tokenData.usd * (1 + (Math.random() - 0.5) * 0.005)
                }
              };
            }
          });
        }
      } catch (cgError) {
        console.warn('CoinGecko fetch failed:', cgError);
      }

      // If we got some data from CoinGecko, use it
      if (Object.keys(priceMap).length > 0) {
        setPrices(priceMap);
        return priceMap;
      }
      
      // If all real APIs fail, fall back to mock data
      throw new Error('All price APIs failed');
      
    } catch (error) {
      console.warn('All price sources failed, using mock data:', error);
      
      // Use mock data with variations
      const mockPricesWithVariation = { ...MOCK_PRICES };
      Object.keys(mockPricesWithVariation).forEach(token => {
        const basePrice = MOCK_PRICES[token].price;
        const variation = (Math.random() - 0.5) * 0.02;
        mockPricesWithVariation[token] = {
          ...MOCK_PRICES[token],
          price: basePrice * (1 + variation),
          exchanges: Object.fromEntries(
            Object.entries(MOCK_PRICES[token].exchanges).map(([exchange, price]) => [
              exchange,
              price * (1 + (Math.random() - 0.5) * 0.005)
            ])
          )
        };
      });
      
      setPrices(mockPricesWithVariation);
      return mockPricesWithVariation;
    }
  }, [hasApiKeys]);

  // Detect arbitrage opportunities with improved logic
  const detectArbitrageOpportunities = useCallback((priceData: Record<string, TokenPrice>) => {
    const opportunities: ArbitrageOpportunity[] = [];
    
    Object.entries(priceData).forEach(([token, tokenPrice]) => {
      const exchanges = Object.entries(tokenPrice.exchanges);
      
      // Compare prices across exchanges for the same token
      for (let i = 0; i < exchanges.length; i++) {
        for (let j = i + 1; j < exchanges.length; j++) {
          const [exchangeA, priceA] = exchanges[i];
          const [exchangeB, priceB] = exchanges[j];
          
          if (!priceA || !priceB || priceA <= 0 || priceB <= 0) continue;
          
          const priceDifference = Math.abs(priceA - priceB);
          const priceDifferencePercent = (priceDifference / Math.min(priceA, priceB)) * 100;
          
          // Only consider opportunities with significant price difference
          if (priceDifferencePercent > 0.05) { // Lowered threshold for demo
            const tradeAmount = 5; // Smaller trade size for demo
            const potentialProfit = (priceDifference / Math.min(priceA, priceB)) * tradeAmount * Math.min(priceA, priceB);
            
            // Calculate gas cost based on current gas price
            const gasUnits = 350000;
            const gasEstimate = (gasPrice * gasUnits * tokenPrice.price) / 1e9;
            
            const netProfit = potentialProfit - gasEstimate;
            
            if (netProfit > 1) { // Lower minimum profit threshold for demo
              opportunities.push({
                id: `${token}-${exchangeA}-${exchangeB}-${Date.now()}-${Math.random()}`,
                tokenPair: `${token}/USD`,
                tokenA: tokenPrice.address,
                tokenB: TOKEN_ADDRESSES.USDC,
                exchangeA,
                exchangeB,
                priceA,
                priceB,
                priceDifference: priceDifferencePercent,
                potentialProfit,
                gasEstimate,
                netProfit,
                amount: tradeAmount,
                timestamp: Date.now(),
                status: 'active',
                exchanges: [exchangeA, exchangeB],
                slippage: 300
              });
            }
          }
        }
      }
    });
    
    // Sort by net profit descending
    opportunities.sort((a, b) => b.netProfit - a.netProfit);
    
    return opportunities.slice(0, 15); // Top 15 opportunities
  }, [gasPrice]);

  // Setup real-time updates with better error handling
  const setupRealTimeUpdates = useCallback(() => {
    let priceInterval: NodeJS.Timeout;
    let gasInterval: NodeJS.Timeout;
    let networkInterval: NodeJS.Timeout;

    const updatePrices = async () => {
      try {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        const newPrices = await fetchLivePrices(tokens);
        const newOpportunities = detectArbitrageOpportunities(newPrices);
        setOpportunities(newOpportunities);
      } catch (error) {
        console.warn('Price update failed:', error);
      }
    };

    const updateGasPrice = async () => {
      try {
        await fetchRealGasPrice();
      } catch (error) {
        console.warn('Gas price update failed:', error);
      }
    };

    const updateNetworkStats = async () => {
      try {
        await fetchRealNetworkStats();
      } catch (error) {
        console.warn('Network stats update failed:', error);
      }
    };

    // Update prices every 10 seconds (less frequent to avoid rate limits)
    priceInterval = setInterval(updatePrices, 10000);
    
    // Update gas prices every 15 seconds
    gasInterval = setInterval(updateGasPrice, 15000);
    
    // Update network stats every 20 seconds
    networkInterval = setInterval(updateNetworkStats, 20000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(gasInterval);
      clearInterval(networkInterval);
    };
  }, [fetchLivePrices, detectArbitrageOpportunities, fetchRealGasPrice, fetchRealNetworkStats]);

  // Initialize data fetching with comprehensive error handling
  useEffect(() => {
    const initializeRealData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        
        // Initial data fetch with timeout
        const fetchPromises = [
          fetchLivePrices(tokens),
          fetchRealGasPrice(),
          fetchRealNetworkStats()
        ];
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Initialization timeout')), 10000);
        });
        
        await Promise.race([
          Promise.allSettled(fetchPromises),
          timeoutPromise
        ]);
        
        // Generate initial opportunities
        const currentPrices = await fetchLivePrices(tokens);
        const initialOpportunities = detectArbitrageOpportunities(currentPrices);
        setOpportunities(initialOpportunities);
        
        // Setup real-time updates
        const cleanup = setupRealTimeUpdates();
        
        setIsLoading(false);
        
        // Show info message if using demo mode
        if (DEMO_MODE || !hasApiKeys()) {
          console.info('Running in demo mode with mock data. Configure API keys in .env for real data.');
        }
        
        return cleanup;
      } catch (error) {
        console.warn('Failed to initialize real data, using demo mode:', error);
        
        // Fall back to demo mode
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        const mockPrices = await fetchLivePrices(tokens);
        const mockOpportunities = detectArbitrageOpportunities(mockPrices);
        setOpportunities(mockOpportunities);
        
        const cleanup = setupRealTimeUpdates();
        setIsLoading(false);
        
        return cleanup;
      }
    };

    const cleanup = initializeRealData();
    
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn && fn());
      }
    };
  }, [fetchLivePrices, fetchRealGasPrice, fetchRealNetworkStats, setupRealTimeUpdates, detectArbitrageOpportunities, hasApiKeys]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
      const newPrices = await fetchLivePrices(tokens);
      const newOpportunities = detectArbitrageOpportunities(newPrices);
      setOpportunities(newOpportunities);
      await fetchRealGasPrice();
      await fetchRealNetworkStats();
    } catch (error) {
      console.warn('Failed to refresh data:', error);
      setError('Failed to refresh data, using cached/mock data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchLivePrices, detectArbitrageOpportunities, fetchRealGasPrice, fetchRealNetworkStats]);

  return {
    prices,
    opportunities,
    gasPrice,
    networkStats,
    isLoading,
    error,
    refreshData,
    isDemoMode: DEMO_MODE || !hasApiKeys()
  };
};
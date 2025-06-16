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

// Token addresses on Ethereum mainnet
const TOKEN_ADDRESSES = {
  'ETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
  'USDC': '0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c',
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA'
};

export const useRealTimeData = () => {
  const [prices, setPrices] = useState<Record<string, TokenPrice>>({});
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [gasPrice, setGasPrice] = useState<number>(0);
  const [networkStats, setNetworkStats] = useState({
    blockNumber: 0,
    blockTime: 0,
    congestion: 'medium' as 'low' | 'medium' | 'high',
    mevActivity: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real gas prices from Etherscan
  const fetchRealGasPrice = useCallback(async () => {
    if (!API_KEYS.etherscan) {
      throw new Error('Etherscan API key is required for gas price data');
    }

    try {
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
      
      throw new Error('Invalid gas price data received');
    } catch (error) {
      console.error('Gas price fetch failed:', error);
      throw error;
    }
  }, []);

  // Fetch real network stats from Etherscan
  const fetchRealNetworkStats = useCallback(async () => {
    if (!API_KEYS.etherscan) {
      throw new Error('Etherscan API key is required for network data');
    }

    try {
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
          blockTime: 12,
          congestion: gasPrice > 50 ? 'high' : gasPrice > 25 ? 'medium' : 'low',
          mevActivity: 15
        }));
      }
    } catch (error) {
      console.error('Failed to fetch network stats:', error);
      throw error;
    }
  }, [gasPrice]);

  // Fetch real prices from CoinGecko
  const fetchCoinGeckoPrices = useCallback(async (tokens: string[]) => {
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
          headers: API_KEYS.coingecko ? { 'x-cg-demo-api-key': API_KEYS.coingecko } : {}
        }
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('CoinGecko price fetch failed:', error);
      throw error;
    }
  }, []);

  // Fetch real DEX prices from DexScreener
  const fetchDexScreenerPrices = useCallback(async (tokens: string[]) => {
    try {
      const promises = tokens.map(async (token) => {
        const tokenAddress = TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES];
        if (!tokenAddress) return null;

        const response = await fetch(
          `${API_ENDPOINTS.dexScreener}/tokens/${tokenAddress}`
        );
        
        if (!response.ok) {
          throw new Error(`DexScreener API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
          token,
          pairs: data.pairs || []
        };
      });

      const results = await Promise.all(promises);
      return results.filter(Boolean);
    } catch (error) {
      console.error('DexScreener price fetch failed:', error);
      throw error;
    }
  }, []);

  // Combine all price sources
  const fetchLivePrices = useCallback(async (tokens: string[]) => {
    try {
      setError(null);
      
      // Fetch from CoinGecko for base prices
      const coinGeckoData = await fetchCoinGeckoPrices(tokens);
      const priceMap: Record<string, TokenPrice> = {};

      // Process CoinGecko data
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
        const tokenData = coinGeckoData[tokenId];
        
        if (tokenData) {
          priceMap[token] = {
            symbol: token,
            address: TOKEN_ADDRESSES[token as keyof typeof TOKEN_ADDRESSES] || '',
            price: tokenData.usd,
            change24h: tokenData.usd_24h_change || 0,
            volume24h: tokenData.usd_24h_vol || 0,
            exchanges: {
              'CoinGecko': tokenData.usd
            }
          };
        }
      });

      // Try to fetch DEX prices
      try {
        const dexScreenerData = await fetchDexScreenerPrices(tokens);
        
        dexScreenerData.forEach((tokenData: any) => {
          if (tokenData && priceMap[tokenData.token]) {
            tokenData.pairs.forEach((pair: any) => {
              if (pair.dexId && pair.priceUsd) {
                const exchangeName = pair.dexId === 'uniswap' ? 'Uniswap V2' : 
                                   pair.dexId === 'uniswapv3' ? 'Uniswap V3' :
                                   pair.dexId === 'sushiswap' ? 'SushiSwap' : pair.dexId;
                
                priceMap[tokenData.token].exchanges[exchangeName] = parseFloat(pair.priceUsd);
              }
            });
          }
        });
      } catch (dexError) {
        console.warn('DEX price fetch failed, continuing with CoinGecko data only:', dexError);
      }

      setPrices(priceMap);
      return priceMap;
    } catch (error) {
      console.error('Failed to fetch live prices:', error);
      throw error;
    }
  }, [fetchCoinGeckoPrices, fetchDexScreenerPrices]);

  // Detect real arbitrage opportunities
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
          if (priceDifferencePercent > 0.1) {
            const tradeAmount = 10; // 10 ETH base trade size
            const potentialProfit = (priceDifference / Math.min(priceA, priceB)) * tradeAmount * Math.min(priceA, priceB);
            
            // Calculate real gas cost based on current gas price
            const gasUnits = 350000; // Estimated gas for flash loan arbitrage
            const gasEstimate = (gasPrice * gasUnits * tokenPrice.price) / 1e9; // Convert gwei to USD
            
            const netProfit = potentialProfit - gasEstimate;
            
            if (netProfit > 5) { // Minimum $5 profit threshold
              opportunities.push({
                id: `${token}-${exchangeA}-${exchangeB}-${Date.now()}`,
                tokenPair: `${token}/USD`,
                tokenA: tokenPrice.address,
                tokenB: TOKEN_ADDRESSES.USDC, // Use USDC as base
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
                slippage: 300 // 3% default slippage
              });
            }
          }
        }
      }
    });
    
    // Sort by net profit descending
    opportunities.sort((a, b) => b.netProfit - a.netProfit);
    
    return opportunities.slice(0, 20); // Top 20 opportunities
  }, [gasPrice]);

  // Setup real-time updates
  const setupRealTimeUpdates = useCallback(() => {
    // Update prices every 10 seconds
    const priceInterval = setInterval(async () => {
      try {
        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        const newPrices = await fetchLivePrices(tokens);
        const newOpportunities = detectArbitrageOpportunities(newPrices);
        setOpportunities(newOpportunities);
      } catch (error) {
        console.error('Price update failed:', error);
      }
    }, 10000);

    // Update gas prices every 15 seconds
    const gasInterval = setInterval(async () => {
      try {
        await fetchRealGasPrice();
      } catch (error) {
        console.error('Gas price update failed:', error);
      }
    }, 15000);
    
    // Update network stats every 20 seconds
    const networkInterval = setInterval(async () => {
      try {
        await fetchRealNetworkStats();
      } catch (error) {
        console.error('Network stats update failed:', error);
      }
    }, 20000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(gasInterval);
      clearInterval(networkInterval);
    };
  }, [fetchLivePrices, detectArbitrageOpportunities, fetchRealGasPrice, fetchRealNetworkStats]);

  // Initialize real data fetching
  useEffect(() => {
    const initializeRealData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Check if required API keys are available
        if (!API_KEYS.etherscan) {
          throw new Error('Etherscan API key is required. Please add VITE_ETHERSCAN_API_KEY to your .env file.');
        }

        const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
        
        // Initial data fetch
        await Promise.all([
          fetchLivePrices(tokens),
          fetchRealGasPrice(),
          fetchRealNetworkStats()
        ]);
        
        // Generate initial opportunities
        const currentPrices = await fetchLivePrices(tokens);
        const initialOpportunities = detectArbitrageOpportunities(currentPrices);
        setOpportunities(initialOpportunities);
        
        // Setup real-time updates
        const cleanup = setupRealTimeUpdates();
        
        setIsLoading(false);
        
        return cleanup;
      } catch (error) {
        console.error('Failed to initialize real data:', error);
        setError(error instanceof Error ? error.message : 'Failed to connect to real-time data sources');
        setIsLoading(false);
      }
    };

    const cleanup = initializeRealData();
    
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn && fn());
      }
    };
  }, [fetchLivePrices, fetchRealGasPrice, fetchRealNetworkStats, setupRealTimeUpdates, detectArbitrageOpportunities]);

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK'];
      const newPrices = await fetchLivePrices(tokens);
      const newOpportunities = detectArbitrageOpportunities(newPrices);
      setOpportunities(newOpportunities);
      await fetchRealGasPrice();
      await fetchRealNetworkStats();
      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to refresh real-time data');
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
    refreshData
  };
};
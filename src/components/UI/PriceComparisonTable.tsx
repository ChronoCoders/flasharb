import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react";

interface PriceData {
  token: string;
  symbol: string;
  uniswapV2: number;
  uniswapV3: number;
  sushiSwap: number;
  oneInch: number;
  bestPrice: number;
  worstPrice: number;
  spread: number;
  volume24h: number;
}

const PriceComparisonTable: React.FC = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateMockPriceData = (): PriceData[] => {
      const tokens = [
        { token: "Ethereum", symbol: "ETH", basePrice: 2450 },
        { token: "USD Coin", symbol: "USDC", basePrice: 1.0001 },
        { token: "Tether", symbol: "USDT", basePrice: 0.9998 },
        { token: "Dai", symbol: "DAI", basePrice: 1.0003 },
        { token: "Wrapped Bitcoin", symbol: "WBTC", basePrice: 43250 },
        { token: "Chainlink", symbol: "LINK", basePrice: 14.75 },
      ];

      return tokens.map(({ token, symbol, basePrice }) => {
        const variance = 0.005; // 0.5% max variance
        const uniswapV2 = basePrice * (1 + (Math.random() - 0.5) * variance);
        const uniswapV3 = basePrice * (1 + (Math.random() - 0.5) * variance);
        const sushiSwap = basePrice * (1 + (Math.random() - 0.5) * variance);
        const oneInch = basePrice * (1 + (Math.random() - 0.5) * variance);

        const prices = [uniswapV2, uniswapV3, sushiSwap, oneInch];
        const bestPrice = Math.max(...prices);
        const worstPrice = Math.min(...prices);
        const spread = ((bestPrice - worstPrice) / worstPrice) * 100;

        return {
          token,
          symbol,
          uniswapV2,
          uniswapV3,
          sushiSwap,
          oneInch,
          bestPrice,
          worstPrice,
          spread,
          volume24h: Math.random() * 10000000 + 1000000,
        };
      });
    };

    setPriceData(generateMockPriceData());
    setLoading(false);

    const interval = setInterval(() => {
      setPriceData(generateMockPriceData());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "WBTC" || symbol === "ETH") {
      return `$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const getPriceColor = (
    price: number,
    bestPrice: number,
    worstPrice: number,
  ) => {
    if (price === bestPrice) return "text-green-500 font-semibold";
    if (price === worstPrice) return "text-red-500 font-semibold";
    return "text-gray-900 dark:text-white";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Price Comparison
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Live Data
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Uniswap V2
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Uniswap V3
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                SushiSwap
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                1inch
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Spread
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                24h Volume
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {priceData.map((data) => (
              <tr
                key={data.symbol}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {data.symbol}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {data.token}
                    </div>
                  </div>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getPriceColor(data.uniswapV2, data.bestPrice, data.worstPrice)}`}
                >
                  {formatPrice(data.uniswapV2, data.symbol)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getPriceColor(data.uniswapV3, data.bestPrice, data.worstPrice)}`}
                >
                  {formatPrice(data.uniswapV3, data.symbol)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getPriceColor(data.sushiSwap, data.bestPrice, data.worstPrice)}`}
                >
                  {formatPrice(data.sushiSwap, data.symbol)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${getPriceColor(data.oneInch, data.bestPrice, data.worstPrice)}`}
                >
                  {formatPrice(data.oneInch, data.symbol)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {data.spread > 0.1 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-gray-400 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${data.spread > 0.1 ? "text-green-500" : "text-gray-500"}`}
                    >
                      {data.spread.toFixed(3)}%
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  ${(data.volume24h / 1000000).toFixed(2)}M
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceComparisonTable;

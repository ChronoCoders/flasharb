import React from 'react';
import { Play, Pause, Settings, AlertTriangle } from 'lucide-react';
import { useStore } from '../../store/useStore';

const TradingInterface: React.FC = () => {
  const { 
    tradingConfig, 
    setTradingConfig, 
    botActive, 
    setBotActive 
  } = useStore();

  const tokens = ['ETH', 'USDC', 'USDT', 'DAI', 'WBTC', 'LINK', 'UNI', 'AAVE'];
  const exchanges = ['Uniswap V2', 'Uniswap V3', 'SushiSwap', '1inch', 'Balancer'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Trading Configuration
        </h1>
        <button
          onClick={() => setBotActive(!botActive)}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            botActive
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {botActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          <span>{botActive ? 'Stop Bot' : 'Start Bot'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Token Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Token Selection
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {tokens.map((token) => (
              <label key={token} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tradingConfig.selectedTokens.includes(token)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTradingConfig({
                        selectedTokens: [...tradingConfig.selectedTokens, token]
                      });
                    } else {
                      setTradingConfig({
                        selectedTokens: tradingConfig.selectedTokens.filter(t => t !== token)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{token}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Exchange Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Exchange Selection
          </h3>
          <div className="space-y-2">
            {exchanges.map((exchange) => (
              <label key={exchange} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={tradingConfig.selectedExchanges.includes(exchange)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTradingConfig({
                        selectedExchanges: [...tradingConfig.selectedExchanges, exchange]
                      });
                    } else {
                      setTradingConfig({
                        selectedExchanges: tradingConfig.selectedExchanges.filter(ex => ex !== exchange)
                      });
                    }
                  }}
                  className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{exchange}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trading Parameters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Trading Parameters
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Profit Threshold: {tradingConfig.minProfitThreshold}%
              </label>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={tradingConfig.minProfitThreshold}
                onChange={(e) => setTradingConfig({ minProfitThreshold: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Transaction Amount: {tradingConfig.maxTransactionAmount} ETH
              </label>
              <input
                type="range"
                min="1"
                max="100"
                step="1"
                value={tradingConfig.maxTransactionAmount}
                onChange={(e) => setTradingConfig({ maxTransactionAmount: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Slippage Tolerance: {tradingConfig.slippageTolerance}%
              </label>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={tradingConfig.slippageTolerance}
                onChange={(e) => setTradingConfig({ slippageTolerance: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Management
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gas Strategy
              </label>
              <select
                value={tradingConfig.gasStrategy}
                onChange={(e) => setTradingConfig({ gasStrategy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="slow">Slow (Low Cost)</option>
                <option value="standard">Standard</option>
                <option value="fast">Fast (High Priority)</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max Daily Loss: ${tradingConfig.maxDailyLoss}
              </label>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={tradingConfig.maxDailyLoss}
                onChange={(e) => setTradingConfig({ maxDailyLoss: parseFloat(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoExecute"
                checked={tradingConfig.autoExecute}
                onChange={(e) => setTradingConfig({ autoExecute: e.target.checked })}
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
              <label htmlFor="autoExecute" className="text-sm text-gray-700 dark:text-gray-300">
                Auto-execute profitable trades
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Trading Risk Warning
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Flash loan arbitrage involves significant financial risk. Only trade with funds you can afford to lose. 
              Market conditions can change rapidly, and trades may fail due to network congestion, slippage, or MEV attacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingInterface;
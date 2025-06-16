import React, { useState, useEffect } from 'react';
import { Calculator, TrendingUp, AlertTriangle, Info } from 'lucide-react';

interface CalculationResult {
  grossProfit: number;
  gasCost: number;
  netProfit: number;
  roi: number;
  breakEvenGasPrice: number;
  riskLevel: 'low' | 'medium' | 'high';
}

const ProfitCalculator: React.FC = () => {
  const [inputs, setInputs] = useState({
    tokenPair: 'ETH/USDC',
    priceA: 2450.50,
    priceB: 2453.25,
    tradeAmount: 10,
    gasPrice: 25,
    gasLimit: 350000,
    slippage: 0.5
  });
  
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    calculateProfit();
  }, [inputs]);

  const calculateProfit = () => {
    const { priceA, priceB, tradeAmount, gasPrice, gasLimit, slippage } = inputs;
    
    // Calculate price difference
    const priceDiff = Math.abs(priceB - priceA);
    const priceDiffPercent = (priceDiff / Math.min(priceA, priceB)) * 100;
    
    // Calculate gross profit (before gas and slippage)
    const grossProfitBeforeSlippage = (priceDiff / Math.min(priceA, priceB)) * tradeAmount * Math.min(priceA, priceB);
    
    // Account for slippage
    const slippageLoss = grossProfitBeforeSlippage * (slippage / 100);
    const grossProfit = grossProfitBeforeSlippage - slippageLoss;
    
    // Calculate gas cost
    const gasCostEth = (gasPrice * gasLimit) / 1e9; // Convert gwei to ETH
    const gasCost = gasCostEth * priceA; // Convert to USD
    
    // Calculate net profit
    const netProfit = grossProfit - gasCost;
    
    // Calculate ROI
    const roi = (netProfit / (tradeAmount * Math.min(priceA, priceB))) * 100;
    
    // Calculate break-even gas price
    const breakEvenGasPrice = (grossProfit * 1e9) / gasLimit;
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (priceDiffPercent < 0.1) riskLevel = 'high';
    else if (priceDiffPercent < 0.3) riskLevel = 'medium';
    
    setResult({
      grossProfit,
      gasCost,
      netProfit,
      roi,
      breakEvenGasPrice,
      riskLevel
    });
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="w-6 h-6 text-primary-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Profit Calculator
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Parameters */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Trade Parameters
          </h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token Pair
            </label>
            <select
              value={inputs.tokenPair}
              onChange={(e) => setInputs(prev => ({ ...prev, tokenPair: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="ETH/USDC">ETH/USDC</option>
              <option value="WBTC/ETH">WBTC/ETH</option>
              <option value="USDT/DAI">USDT/DAI</option>
              <option value="LINK/ETH">LINK/ETH</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price A ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.priceA}
                onChange={(e) => setInputs(prev => ({ ...prev, priceA: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Price B ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={inputs.priceB}
                onChange={(e) => setInputs(prev => ({ ...prev, priceB: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trade Amount (ETH)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.tradeAmount}
              onChange={(e) => setInputs(prev => ({ ...prev, tradeAmount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gas Price (gwei)
              </label>
              <input
                type="number"
                value={inputs.gasPrice}
                onChange={(e) => setInputs(prev => ({ ...prev, gasPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gas Limit
              </label>
              <input
                type="number"
                value={inputs.gasLimit}
                onChange={(e) => setInputs(prev => ({ ...prev, gasLimit: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slippage Tolerance (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={inputs.slippage}
              onChange={(e) => setInputs(prev => ({ ...prev, slippage: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        {/* Results */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Calculation Results
          </h4>
          
          {result && (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gross Profit</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${result.grossProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Gas Cost</span>
                    <span className="text-lg font-semibold text-red-500">
                      -${result.gasCost.toFixed(2)}
                    </span>
                  </div>
                  <hr className="border-gray-300 dark:border-gray-600 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Net Profit</span>
                    <span className={`text-xl font-bold ${result.netProfit > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${result.netProfit.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">ROI</span>
                    </div>
                    <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                      {result.roi.toFixed(2)}%
                    </span>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${getRiskColor(result.riskLevel)}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Risk Level</span>
                    </div>
                    <span className="text-lg font-bold capitalize">
                      {result.riskLevel}
                    </span>
                  </div>
                </div>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-yellow-600 dark:text-yellow-400">Break-even Gas Price</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                    {result.breakEvenGasPrice.toFixed(1)} gwei
                  </span>
                </div>
              </div>
              
              {/* Recommendations */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Recommendations
                </h5>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {result.netProfit <= 0 && (
                    <li>• Trade not profitable at current gas prices</li>
                  )}
                  {result.riskLevel === 'high' && (
                    <li>• High risk due to low price difference</li>
                  )}
                  {result.roi < 1 && result.netProfit > 0 && (
                    <li>• Low ROI - consider larger trade size</li>
                  )}
                  {result.netProfit > 0 && result.riskLevel === 'low' && (
                    <li>• ✓ Good opportunity with acceptable risk</li>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;
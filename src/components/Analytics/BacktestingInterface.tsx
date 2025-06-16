import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, DollarSign, BarChart3, Play, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface BacktestResult {
  date: string;
  profit: number;
  trades: number;
  successRate: number;
  gasSpent: number;
  netProfit: number;
}

const BacktestingInterface: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResult[]>([]);
  const [summary, setSummary] = useState({
    totalProfit: 0,
    totalTrades: 0,
    avgSuccessRate: 0,
    totalGasSpent: 0,
    netProfit: 0,
    sharpeRatio: 0,
    maxDrawdown: 0
  });

  const runBacktest = async () => {
    setIsRunning(true);
    
    // Simulate backtesting process
    const days = Math.ceil((new Date(dateRange.endDate).getTime() - new Date(dateRange.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const mockResults: BacktestResult[] = [];
    
    let cumulativeProfit = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(new Date(dateRange.startDate).getTime() + i * 24 * 60 * 60 * 1000);
      const dailyTrades = Math.floor(Math.random() * 15) + 5;
      const successRate = 0.75 + Math.random() * 0.2; // 75-95% success rate
      const avgProfitPerTrade = 15 + Math.random() * 30;
      const gasPerTrade = 8 + Math.random() * 12;
      
      const grossProfit = dailyTrades * avgProfitPerTrade * successRate;
      const gasSpent = dailyTrades * gasPerTrade;
      const netProfit = grossProfit - gasSpent;
      
      cumulativeProfit += netProfit;
      
      mockResults.push({
        date: date.toISOString().split('T')[0],
        profit: grossProfit,
        trades: dailyTrades,
        successRate: successRate * 100,
        gasSpent,
        netProfit: cumulativeProfit
      });
      
      // Simulate progress
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    setResults(mockResults);
    
    // Calculate summary
    const totalProfit = mockResults.reduce((sum, day) => sum + day.profit, 0);
    const totalTrades = mockResults.reduce((sum, day) => sum + day.trades, 0);
    const avgSuccessRate = mockResults.reduce((sum, day) => sum + day.successRate, 0) / mockResults.length;
    const totalGasSpent = mockResults.reduce((sum, day) => sum + day.gasSpent, 0);
    const netProfit = totalProfit - totalGasSpent;
    
    setSummary({
      totalProfit,
      totalTrades,
      avgSuccessRate,
      totalGasSpent,
      netProfit,
      sharpeRatio: 2.3 + Math.random() * 0.5,
      maxDrawdown: Math.random() * 5 + 2
    });
    
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Strategy Backtesting
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={runBacktest}
              disabled={isRunning}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>{isRunning ? 'Running...' : 'Run Backtest'}</span>
            </button>
          </div>
        </div>
        
        {results.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">Net Profit</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      ${summary.netProfit.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Trades</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {summary.totalTrades}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">Success Rate</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {summary.avgSuccessRate.toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {summary.sharpeRatio.toFixed(2)}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Cumulative Profit
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(value) => `$${value}`} />
                      <Tooltip 
                        formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Net Profit']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="netProfit" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Trades
                </h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value) => [value, 'Trades']}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Bar dataKey="trades" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span>Export Results</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BacktestingInterface;
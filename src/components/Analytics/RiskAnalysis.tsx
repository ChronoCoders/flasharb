import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingDown, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface RiskMetric {
  name: string;
  value: number;
  status: 'low' | 'medium' | 'high';
  description: string;
}

const RiskAnalysis: React.FC = () => {
  const [riskMetrics, setRiskMetrics] = useState<RiskMetric[]>([]);
  const [portfolioRisk, setPortfolioRisk] = useState({
    overallScore: 0,
    maxDrawdown: 0,
    volatility: 0,
    sharpeRatio: 0
  });

  useEffect(() => {
    // Generate mock risk data
    const mockMetrics: RiskMetric[] = [
      {
        name: 'Gas Price Risk',
        value: 25,
        status: 'medium',
        description: 'Risk of high gas prices affecting profitability'
      },
      {
        name: 'Slippage Risk',
        value: 15,
        status: 'low',
        description: 'Risk of price movement during execution'
      },
      {
        name: 'MEV Risk',
        value: 35,
        status: 'high',
        description: 'Risk of front-running and sandwich attacks'
      },
      {
        name: 'Liquidity Risk',
        value: 20,
        status: 'medium',
        description: 'Risk of insufficient liquidity for large trades'
      },
      {
        name: 'Smart Contract Risk',
        value: 10,
        status: 'low',
        description: 'Risk of smart contract vulnerabilities'
      }
    ];

    setRiskMetrics(mockMetrics);
    setPortfolioRisk({
      overallScore: 65,
      maxDrawdown: 8.5,
      volatility: 12.3,
      sharpeRatio: 2.1
    });
  }, []);

  const getRiskColor = (status: string) => {
    switch (status) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getRiskBgColor = (status: string) => {
    switch (status) {
      case 'low': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'medium': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default: return 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800';
    }
  };

  const pieData = riskMetrics.map(metric => ({
    name: metric.name,
    value: metric.value,
    color: getRiskColor(metric.status)
  }));

  const historicalDrawdown = [
    { month: 'Jan', drawdown: 2.1 },
    { month: 'Feb', drawdown: 4.3 },
    { month: 'Mar', drawdown: 1.8 },
    { month: 'Apr', drawdown: 6.2 },
    { month: 'May', drawdown: 3.5 },
    { month: 'Jun', drawdown: 8.5 },
  ];

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Risk Analysis Dashboard
          </h3>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Live Risk Monitoring</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {portfolioRisk.overallScore}/100
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Overall Risk Score</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${portfolioRisk.overallScore}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-red-500 mb-2">
              {portfolioRisk.maxDrawdown}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Max Drawdown</div>
            <TrendingDown className="w-6 h-6 text-red-500 mx-auto mt-2" />
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              {portfolioRisk.volatility}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Volatility</div>
            <Activity className="w-6 h-6 text-yellow-500 mx-auto mt-2" />
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {portfolioRisk.sharpeRatio}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Sharpe Ratio</div>
            <Shield className="w-6 h-6 text-green-500 mx-auto mt-2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Breakdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Risk Breakdown
          </h4>
          
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Risk Level']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            {riskMetrics.map((metric, index) => (
              <div key={index} className={`p-3 rounded-lg border ${getRiskBgColor(metric.status)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.name}
                  </span>
                  <span className={`text-sm font-semibold`} style={{ color: getRiskColor(metric.status) }}>
                    {metric.value}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {metric.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Drawdown */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Historical Drawdown
          </h4>
          
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalDrawdown}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Drawdown']} />
                <Bar dataKey="drawdown" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h5 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Risk Management Tips
                </h5>
                <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
                  <li>• Monitor gas prices during high network congestion</li>
                  <li>• Use MEV protection for large trades</li>
                  <li>• Set stop-loss limits to prevent excessive drawdown</li>
                  <li>• Diversify across multiple token pairs</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Risk Alerts
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                High Gas Price Alert
              </div>
              <div className="text-xs text-yellow-700 dark:text-yellow-300">
                Current gas price (45 gwei) is above your threshold. Consider waiting for lower fees.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-red-800 dark:text-red-200">
                MEV Activity Detected
              </div>
              <div className="text-xs text-red-700 dark:text-red-300">
                High MEV activity on ETH/USDC pair. Enable MEV protection for trades.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
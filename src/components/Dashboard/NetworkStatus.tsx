import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';

interface NetworkData {
  gasPrice: {
    slow: number;
    standard: number;
    fast: number;
  };
  blockNumber: number;
  blockTime: number;
  congestion: 'low' | 'medium' | 'high';
  mevActivity: number;
}

const NetworkStatus: React.FC = () => {
  const [networkData, setNetworkData] = useState<NetworkData>({
    gasPrice: { slow: 15, standard: 25, fast: 35 },
    blockNumber: 18500000,
    blockTime: 12.5,
    congestion: 'medium',
    mevActivity: 23
  });

  useEffect(() => {
    const updateNetworkData = () => {
      setNetworkData(prev => ({
        gasPrice: {
          slow: 12 + Math.random() * 8,
          standard: 20 + Math.random() * 15,
          fast: 30 + Math.random() * 20
        },
        blockNumber: prev.blockNumber + Math.floor(Math.random() * 3),
        blockTime: 11 + Math.random() * 3,
        congestion: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
        mevActivity: 15 + Math.random() * 20
      }));
    };

    const interval = setInterval(updateNetworkData, 5000);
    return () => clearInterval(interval);
  }, []);

  const getCongestionColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Network Status
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Zap className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Standard Gas</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {networkData.gasPrice.standard.toFixed(0)} gwei
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Activity className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Block Number</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {networkData.blockNumber.toLocaleString()}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Block Time</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {networkData.blockTime.toFixed(1)}s
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <TrendingUp className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">MEV Activity</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {networkData.mevActivity.toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Network Congestion
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getCongestionColor(networkData.congestion)}`}>
            {networkData.congestion}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-xs text-green-600 dark:text-green-400 mb-1">Slow</div>
            <div className="text-sm font-semibold text-green-700 dark:text-green-300">
              {networkData.gasPrice.slow.toFixed(0)} gwei
            </div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mb-1">Standard</div>
            <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
              {networkData.gasPrice.standard.toFixed(0)} gwei
            </div>
          </div>
          
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-xs text-red-600 dark:text-red-400 mb-1">Fast</div>
            <div className="text-sm font-semibold text-red-700 dark:text-red-300">
              {networkData.gasPrice.fast.toFixed(0)} gwei
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;
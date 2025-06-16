import React from 'react';
import { ArrowRight, TrendingUp, Clock, Zap } from 'lucide-react';
import { ArbitrageOpportunity } from '../../types';

interface OpportunityCardProps {
  opportunity: ArbitrageOpportunity;
  onExecute: (id: string) => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity, onExecute }) => {
  const profitColor = opportunity.netProfit > 0 ? 'text-green-500' : 'text-red-500';
  const profitBg = opportunity.netProfit > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900 dark:text-white">
            {opportunity.tokenPair}
          </span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${profitBg} ${profitColor}`}>
            {opportunity.priceDifference.toFixed(2)}%
          </div>
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          <span>{Math.floor((Date.now() - opportunity.timestamp) / 1000)}s ago</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {opportunity.exchangeA}
          </span>
          <span className="text-sm font-medium">${opportunity.priceA.toFixed(4)}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400" />
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {opportunity.exchangeB}
          </span>
          <span className="text-sm font-medium">${opportunity.priceB.toFixed(4)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Potential Profit</p>
          <p className="text-sm font-semibold text-green-500">
            ${opportunity.potentialProfit.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Gas Cost</p>
          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            ${opportunity.gasEstimate.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Net Profit</p>
          <p className={`text-lg font-bold ${profitColor}`}>
            ${opportunity.netProfit.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => onExecute(opportunity.id)}
          disabled={opportunity.netProfit <= 0 || opportunity.status !== 'active'}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
        >
          <Zap className="w-4 h-4" />
          <span>Execute</span>
        </button>
      </div>
    </div>
  );
};

export default OpportunityCard;
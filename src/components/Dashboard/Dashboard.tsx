import React, { useEffect } from 'react';
import { DollarSign, TrendingUp, Activity, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useArbitrageContract } from '../../hooks/useArbitrageContract';
import StatsCard from './StatsCard';
import OpportunityCard from './OpportunityCard';
import ProfitChart from './ProfitChart';
import NetworkStatus from './NetworkStatus';
import PriceComparisonTable from '../UI/PriceComparisonTable';
import { ArbitrageOpportunity } from '../../types';

const Dashboard: React.FC = () => {
  const { 
    portfolio, 
    setPortfolio,
    addTransaction 
  } = useStore();
  
  const { opportunities, prices, gasPrice, networkStats, isLoading, error } = useRealTimeData();
  const { executeArbitrage, isExecuting } = useArbitrageContract();

  // Mock data generation
  useEffect(() => {
    // Set mock portfolio data
    setPortfolio({
      totalBalance: 12.45,
      totalProfit: 445.67,
      totalTrades: 23,
      successRate: 87.5,
      dailyPnL: 67.23,
      weeklyPnL: 234.56,
      monthlyPnL: 445.67,
    });
  }, [setPortfolio]);

  const handleExecuteTrade = async (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    try {
      // Execute real arbitrage trade
      const result = await executeArbitrage(opportunity);
      
      addTransaction({
        id: `tx-${Date.now()}`,
        hash: result.hash,
        type: 'arbitrage',
        tokenPair: opportunity.tokenPair,
        amount: opportunity.amount,
        profit: result.success ? opportunity.netProfit : -opportunity.gasEstimate,
        gasUsed: parseInt(result.gasUsed),
        gasCost: opportunity.gasEstimate,
        status: result.success ? 'success' : 'failed',
        timestamp: Date.now(),
        exchanges: [opportunity.exchangeA, opportunity.exchangeB],
      });
      
    } catch (error) {
      console.error('Trade execution failed:', error);
      
      addTransaction({
        id: `tx-${Date.now()}`,
        hash: '',
        type: 'arbitrage',
        tokenPair: opportunity.tokenPair,
        amount: opportunity.amount,
        profit: -opportunity.gasEstimate,
        gasUsed: 0,
        gasCost: opportunity.gasEstimate,
        status: 'failed',
        timestamp: Date.now(),
        exchanges: [opportunity.exchangeA, opportunity.exchangeB],
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-700 dark:text-red-300">Error loading data: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Live Market Data {isLoading && '(Loading...)'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Profit"
          value={`$${portfolio.totalProfit.toFixed(2)}`}
          change={12.5}
          icon={DollarSign}
          color="green"
        />
        <StatsCard
          title="Success Rate"
          value={`${portfolio.successRate}%`}
          change={2.3}
          icon={Target}
          color="blue"
        />
        <StatsCard
          title="Active Opportunities"
          value={opportunities.filter(opp => opp.status === 'active').length}
          icon={Activity}
          color="yellow"
        />
        <StatsCard
          title="24h P&L"
          value={`$${portfolio.dailyPnL.toFixed(2)}`}
          change={portfolio.dailyPnL > 0 ? 8.7 : -3.2}
          icon={TrendingUp}
          color={portfolio.dailyPnL > 0 ? 'green' : 'red'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div>
          <ProfitChart />
        </div>

        {/* Network Status */}
        <div>
          <NetworkStatus />
        </div>
      </div>

      {/* Price Comparison Table */}
      <div>
        <PriceComparisonTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Opportunities List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Live Opportunities
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {opportunities.filter(opp => opp.netProfit > 0).length} profitable
            </span>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {opportunities
              .sort((a, b) => b.netProfit - a.netProfit)
              .map((opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onExecute={handleExecuteTrade}
                  isExecuting={isExecuting}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
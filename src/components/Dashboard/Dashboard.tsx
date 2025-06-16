import React, { useEffect } from 'react';
import { DollarSign, TrendingUp, Activity, Target } from 'lucide-react';
import { useStore } from '../../store/useStore';
import StatsCard from './StatsCard';
import OpportunityCard from './OpportunityCard';
import ProfitChart from './ProfitChart';
import NetworkStatus from './NetworkStatus';
import PriceComparisonTable from '../UI/PriceComparisonTable';
import { ArbitrageOpportunity } from '../../types';

const Dashboard: React.FC = () => {
  const { 
    opportunities, 
    setOpportunities, 
    portfolio, 
    setPortfolio,
    addTransaction 
  } = useStore();

  // Mock data generation
  useEffect(() => {
    const generateMockOpportunities = (): ArbitrageOpportunity[] => {
      const tokens = ['ETH/USDC', 'WBTC/ETH', 'USDT/DAI', 'LINK/ETH'];
      const exchanges = ['Uniswap V2', 'Uniswap V3', 'SushiSwap', '1inch'];
      
      return Array.from({ length: 6 }, (_, i) => {
        const tokenPair = tokens[Math.floor(Math.random() * tokens.length)];
        const exchangeA = exchanges[Math.floor(Math.random() * exchanges.length)];
        let exchangeB = exchanges[Math.floor(Math.random() * exchanges.length)];
        while (exchangeB === exchangeA) {
          exchangeB = exchanges[Math.floor(Math.random() * exchanges.length)];
        }
        
        const priceA = 1000 + Math.random() * 2000;
        const priceDiff = (Math.random() - 0.5) * 5; // -2.5% to +2.5%
        const priceB = priceA * (1 + priceDiff / 100);
        const potentialProfit = Math.abs(priceA - priceB) * (5 + Math.random() * 10);
        const gasEstimate = 15 + Math.random() * 25;
        const netProfit = potentialProfit - gasEstimate;
        
        return {
          id: `opp-${i}`,
          tokenPair,
          tokenA: tokenPair.split('/')[0],
          tokenB: tokenPair.split('/')[1],
          exchangeA,
          exchangeB,
          priceA,
          priceB,
          priceDifference: Math.abs(priceDiff),
          potentialProfit,
          gasEstimate,
          netProfit,
          timestamp: Date.now() - Math.random() * 60000,
          status: 'active' as const,
        };
      });
    };

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

    // Generate initial opportunities
    setOpportunities(generateMockOpportunities());

    // Update opportunities every 5 seconds
    const interval = setInterval(() => {
      setOpportunities(generateMockOpportunities());
    }, 5000);

    return () => clearInterval(interval);
  }, [setOpportunities, setPortfolio]);

  const handleExecuteTrade = (opportunityId: string) => {
    const opportunity = opportunities.find(opp => opp.id === opportunityId);
    if (!opportunity) return;

    // Update opportunity status
    setOpportunities(opportunities.map(opp => 
      opp.id === opportunityId 
        ? { ...opp, status: 'executing' as const }
        : opp
    ));

    // Simulate trade execution
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate
      
      addTransaction({
        id: `tx-${Date.now()}`,
        hash: `0x${Math.random().toString(16).substr(2, 64)}`,
        type: 'arbitrage',
        tokenPair: opportunity.tokenPair,
        amount: 5 + Math.random() * 10,
        profit: success ? opportunity.netProfit : -opportunity.gasEstimate,
        gasUsed: 150000 + Math.random() * 50000,
        gasCost: opportunity.gasEstimate,
        status: success ? 'success' : 'failed',
        timestamp: Date.now(),
        exchanges: [opportunity.exchangeA, opportunity.exchangeB],
      });

      // Update opportunity status
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, status: success ? 'completed' : 'failed' }
          : opp
      ));
    }, 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Live Market Data
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
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
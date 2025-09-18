import React, { useEffect } from "react";
import { DollarSign, TrendingUp, Activity, Target } from "lucide-react";
import { useStore } from "../../store/useStore";
import { useRealTimeData } from "../../hooks/useRealTimeData";
import { useArbitrageContract } from "../../hooks/useArbitrageContract";
import StatsCard from "./StatsCard";
import OpportunityCard from "./OpportunityCard";
import ProfitChart from "./ProfitChart";
import NetworkStatus from "./NetworkStatus";
import PriceComparisonTable from "../UI/PriceComparisonTable";
import { ArbitrageOpportunity } from "../../types";

const Dashboard: React.FC = () => {
  const { portfolio, addTransaction } = useStore();

  const {
    opportunities,
    prices,
    gasPrice,
    networkStats,
    isLoading,
    error,
    refreshData,
  } = useRealTimeData();
  const { executeArbitrage, isExecuting } = useArbitrageContract();

  const handleExecuteTrade = async (opportunityId: string) => {
    const opportunity = opportunities.find((opp) => opp.id === opportunityId);
    if (!opportunity) return;

    try {
      // Execute real arbitrage trade
      const result = await executeArbitrage(opportunity);

      addTransaction({
        id: `tx-${Date.now()}`,
        hash: result.hash,
        type: "arbitrage",
        tokenPair: opportunity.tokenPair,
        amount: opportunity.amount,
        profit: result.success
          ? opportunity.netProfit
          : -opportunity.gasEstimate,
        gasUsed: parseInt(result.gasUsed),
        gasCost: opportunity.gasEstimate,
        status: result.success ? "success" : "failed",
        timestamp: Date.now(),
        exchanges: [opportunity.exchangeA, opportunity.exchangeB],
      });
    } catch (error) {
      console.error("Trade execution failed:", error);

      addTransaction({
        id: `tx-${Date.now()}`,
        hash: "",
        type: "arbitrage",
        tokenPair: opportunity.tokenPair,
        amount: opportunity.amount,
        profit: -opportunity.gasEstimate,
        gasUsed: 0,
        gasCost: opportunity.gasEstimate,
        status: "failed",
        timestamp: Date.now(),
        exchanges: [opportunity.exchangeA, opportunity.exchangeB],
      });
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Real-Time Data Connection Error
          </h3>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <div className="text-sm text-red-600 dark:text-red-400 mb-4">
            <p className="mb-2">
              To connect to real-time data, please ensure you have:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Valid API keys configured in your environment variables</li>
              <li>
                VITE_ETHERSCAN_API_KEY for gas prices and network data
                (required)
              </li>
              <li>
                VITE_COINGECKO_API_KEY for token prices (optional but
                recommended)
              </li>
              <li>Stable internet connection</li>
              <li>No firewall blocking API requests</li>
            </ul>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry Connection
            </button>
            <a
              href="https://etherscan.io/apis"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Get Etherscan API Key
            </a>
          </div>
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isLoading
                ? "Connecting to Real-Time Data..."
                : "Live Market Data Connected"}
            </span>
          </div>
          <button
            onClick={refreshData}
            disabled={isLoading}
            className="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white rounded transition-colors"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
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
          value={opportunities.filter((opp) => opp.status === "active").length}
          icon={Activity}
          color="yellow"
        />
        <StatsCard
          title="Current Gas Price"
          value={`${gasPrice.toFixed(1)} gwei`}
          change={gasPrice > 30 ? -5.2 : 3.1}
          icon={TrendingUp}
          color={gasPrice > 30 ? "red" : "green"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div>
          <ProfitChart />
        </div>

        {/* Network Status */}
        <div>
          <NetworkStatus
            gasPrice={gasPrice}
            blockNumber={networkStats.blockNumber}
            blockTime={networkStats.blockTime}
            congestion={networkStats.congestion}
          />
        </div>
      </div>

      {/* Price Comparison Table */}
      <div>
        <PriceComparisonTable prices={prices} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        {/* Opportunities List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Real-Time Arbitrage Opportunities
            </h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {opportunities.filter((opp) => opp.netProfit > 0).length}{" "}
              profitable
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading real-time opportunities...
              </p>
            </div>
          ) : opportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No profitable arbitrage opportunities found at current gas
                prices.
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                Current gas price: {gasPrice.toFixed(1)} gwei
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Opportunities will appear when price differences exceed gas
                costs
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

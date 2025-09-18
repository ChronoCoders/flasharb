import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  DollarSign,
  AlertTriangle,
  Play,
  Pause,
  Download,
  Upload,
  RefreshCw,
} from "lucide-react";
import { useArbitrageContract } from "../../hooks/useArbitrageContract";
import { useStore } from "../../store/useStore";

const ContractManager: React.FC = () => {
  const { wallet } = useStore();
  const {
    getContractBalance,
    withdrawProfits,
    getRiskStatus,
    pauseContract,
    isExecuting,
  } = useArbitrageContract();

  const [contractBalances, setContractBalances] = useState<
    Record<string, string>
  >({});
  const [riskStatus, setRiskStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState("ETH");

  const tokens = [
    { symbol: "ETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2" },
    { symbol: "USDC", address: "0xA0b86a33E6417c4c6b8c4c6b8c4c6b8c4c6b8c4c" },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7" },
    { symbol: "DAI", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F" },
  ];

  // Fetch contract data
  useEffect(() => {
    const fetchContractData = async () => {
      if (!wallet.connected) return;

      setIsLoading(true);
      try {
        // Fetch balances for all tokens
        const balancePromises = tokens.map(async (token) => {
          const balance = await getContractBalance(token.address);
          return { symbol: token.symbol, balance };
        });

        const balances = await Promise.all(balancePromises);
        const balanceMap = balances.reduce(
          (acc, { symbol, balance }) => {
            acc[symbol] = balance;
            return acc;
          },
          {} as Record<string, string>,
        );

        setContractBalances(balanceMap);

        // Fetch risk status
        const risk = await getRiskStatus();
        setRiskStatus(risk);
      } catch (error) {
        console.error("Failed to fetch contract data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContractData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchContractData, 30000);
    return () => clearInterval(interval);
  }, [wallet.connected, getContractBalance, getRiskStatus]);

  const handleWithdrawProfits = async () => {
    if (!withdrawAmount || !selectedToken) return;

    try {
      const tokenAddress = tokens.find(
        (t) => t.symbol === selectedToken,
      )?.address;
      if (!tokenAddress) return;

      const txHash = await withdrawProfits(tokenAddress, withdrawAmount);
      console.log("Withdrawal successful:", txHash);

      // Refresh balances
      const balance = await getContractBalance(tokenAddress);
      setContractBalances((prev) => ({
        ...prev,
        [selectedToken]: balance,
      }));

      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdrawal failed:", error);
    }
  };

  const handlePauseContract = async () => {
    try {
      const txHash = await pauseContract();
      console.log("Contract paused:", txHash);
    } catch (error) {
      console.error("Failed to pause contract:", error);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Connect your wallet to manage smart contracts
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Contract Manager
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Contract Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Contract Status
            </h3>
            <Shield className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Status</span>
              <span className="text-green-500 font-medium">Active</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Owner</span>
              <span className="text-gray-900 dark:text-white font-mono text-sm">
                {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Network</span>
              <span className="text-gray-900 dark:text-white">Ethereum</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Risk Status
            </h3>
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          {riskStatus ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Daily Loss
                </span>
                <span className="text-gray-900 dark:text-white">
                  ${parseFloat(riskStatus.currentDailyLoss).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Remaining Limit
                </span>
                <span className="text-green-500">
                  ${parseFloat(riskStatus.remainingDailyLimit).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Can Trade
                </span>
                <span
                  className={
                    riskStatus.canTrade ? "text-green-500" : "text-red-500"
                  }
                >
                  {riskStatus.canTrade ? "Yes" : "No"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400">Loading...</div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <Settings className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-3">
            <button
              onClick={handlePauseContract}
              disabled={isExecuting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              <Pause className="w-4 h-4" />
              <span>Emergency Pause</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contract Balances */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contract Balances
        </h3>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Loading balances...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tokens.map((token) => (
              <div
                key={token.symbol}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {token.symbol}
                  </span>
                  <DollarSign className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {contractBalances[token.symbol] || "0.00"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Available for withdrawal
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profit Withdrawal */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Withdraw Profits
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Token
            </label>
            <select
              value={selectedToken}
              onChange={(e) => setSelectedToken(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {tokens.map((token) => (
                <option key={token.symbol} value={token.symbol}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleWithdrawProfits}
              disabled={!withdrawAmount || isExecuting}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>Note:</strong> Withdrawals will transfer tokens to your
              connected wallet address. Make sure you have enough ETH for gas
              fees.
            </div>
          </div>
        </div>
      </div>

      {/* Contract Information */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Contract Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Deployed Contracts
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Arbitrage Bot
                </span>
                <span className="text-blue-500 font-mono text-sm">
                  0x1234...7890
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  DEX Aggregator
                </span>
                <span className="text-blue-500 font-mono text-sm">
                  0x2345...8901
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Risk Manager
                </span>
                <span className="text-blue-500 font-mono text-sm">
                  0x3456...9012
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  Price Oracle
                </span>
                <span className="text-blue-500 font-mono text-sm">
                  0x4567...0123
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
              Security Features
            </h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Multi-signature wallet
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Emergency pause function
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Slippage protection
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Daily loss limits
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractManager;

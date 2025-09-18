import React from "react";
import { Save, RefreshCw, AlertTriangle, Shield } from "lucide-react";
import { useStore } from "../../store/useStore";

const Settings: React.FC = () => {
  const { tradingConfig, setTradingConfig } = useStore();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>API Configuration</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Infura Project ID
              </label>
              <input
                type="password"
                placeholder="Enter your Infura project ID"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alchemy API Key
              </label>
              <input
                type="password"
                placeholder="Enter your Alchemy API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                1inch API Key
              </label>
              <input
                type="password"
                placeholder="Enter your 1inch API key"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Advanced Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  MEV Protection
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Use Flashbots Protect for MEV protection
                </p>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-compound Profits
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automatically reinvest profits
                </p>
              </div>
              <input
                type="checkbox"
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Emergency Stop
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enable emergency circuit breaker
                </p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trade Execution Alerts
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Profit Threshold Alerts
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Error Notifications
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Data Management
          </h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
              <Save className="w-4 h-4" />
              <span>Export Trading Data</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Reset Configuration</span>
            </button>

            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              <AlertTriangle className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Important Legal Disclaimer
        </h4>
        <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
          <p>
            <strong>Financial Risk:</strong> Flash loan arbitrage trading
            involves substantial risk of financial loss. Only trade with funds
            you can afford to lose completely.
          </p>
          <p>
            <strong>Smart Contract Risk:</strong> Interacting with DeFi
            protocols carries risks including smart contract bugs, exploits, and
            protocol failures that could result in total loss of funds.
          </p>
          <p>
            <strong>Regulatory Compliance:</strong> You are solely responsible
            for ensuring compliance with all applicable laws and regulations in
            your jurisdiction regarding cryptocurrency trading and DeFi
            activities.
          </p>
          <p>
            <strong>No Liability:</strong> The developers of this application
            accept no liability for any losses, damages, or legal issues arising
            from the use of this software.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;

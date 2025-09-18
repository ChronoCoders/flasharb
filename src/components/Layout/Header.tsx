import React from "react";
import { Moon, Sun, Activity, Zap } from "lucide-react";
import { useStore } from "../../store/useStore";
import WalletButton from "../UI/WalletButton";
import NetworkSelector from "../UI/NetworkSelector";

const Header: React.FC = () => {
  const { isDarkMode, toggleTheme, botActive } = useStore();

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                FlashArb
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Flash Loan Arbitrage Bot
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-8">
            <Activity
              className={`w-4 h-4 ${botActive ? "text-success-500" : "text-gray-400"}`}
            />
            <span
              className={`text-sm font-medium ${botActive ? "text-success-500" : "text-gray-400"}`}
            >
              {botActive ? "Bot Active" : "Bot Inactive"}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <NetworkSelector />
          <WalletButton />

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

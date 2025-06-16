import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import LandingPage from './components/Landing/LandingPage';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import TradingInterface from './components/Trading/TradingInterface';
import TransactionHistory from './components/History/TransactionHistory';
import Settings from './components/Settings/Settings';

function App() {
  const { isDarkMode, currentView, wallet, isNetworkSwitching } = useStore();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Show landing page if wallet is not connected and not in the middle of network switching
  if (!wallet.connected && !isNetworkSwitching) {
    return <LandingPage />;
  }

  // Show loading state during network switching
  if (isNetworkSwitching) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Switching Network
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please confirm the network switch in your wallet...
          </p>
        </div>
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'trading':
        return <TradingInterface />;
      case 'history':
        return <TransactionHistory />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;
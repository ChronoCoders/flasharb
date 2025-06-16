import React, { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

const WalletButton: React.FC = () => {
  const { wallet, setWallet } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Simulate wallet connection
      setTimeout(() => {
        setWallet({
          address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
          balance: 2.45,
          network: {
            chainId: 1,
            name: 'Ethereum',
            symbol: 'ETH',
            rpcUrl: 'https://mainnet.infura.io/v3/',
            blockExplorer: 'https://etherscan.io',
            gasPrice: 25,
            blockNumber: 18500000,
          },
          connected: true,
        });
        setIsConnecting(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet({
      address: null,
      balance: 0,
      network: null,
      connected: false,
    });
  };

  if (!wallet.connected) {
    return (
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white rounded-lg transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
        <Wallet className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {wallet.balance.toFixed(3)} ETH
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {wallet.address}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Balance: {wallet.balance.toFixed(6)} ETH
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};

export default WalletButton;
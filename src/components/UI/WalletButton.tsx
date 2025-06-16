import React, { useState } from 'react';
import { Wallet, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

interface WalletButtonProps {
  variant?: 'default' | 'landing';
  size?: 'default' | 'large';
}

const WalletButton: React.FC<WalletButtonProps> = ({ 
  variant = 'default',
  size = 'default'
}) => {
  const { wallet, setWallet } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please connect your wallet.');
      }

      // Get network information
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      // Convert balance from wei to ETH
      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

      // Get network details
      const networkMap: Record<string, any> = {
        '0x1': {
          chainId: 1,
          name: 'Ethereum',
          symbol: 'ETH',
          rpcUrl: 'https://mainnet.infura.io/v3/',
          blockExplorer: 'https://etherscan.io',
        },
        '0x89': {
          chainId: 137,
          name: 'Polygon',
          symbol: 'MATIC',
          rpcUrl: 'https://polygon-rpc.com/',
          blockExplorer: 'https://polygonscan.com',
        },
        '0x38': {
          chainId: 56,
          name: 'BSC',
          symbol: 'BNB',
          rpcUrl: 'https://bsc-dataseed1.binance.org/',
          blockExplorer: 'https://bscscan.com',
        }
      };

      const currentNetwork = networkMap[chainId] || networkMap['0x1'];
      
      // Set wallet state
      setWallet({
        address: accounts[0],
        balance: balanceInEth,
        network: {
          ...currentNetwork,
          gasPrice: 0,
          blockNumber: 0
        },
        connected: true,
      });

      // Set up event listeners for account and network changes
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWallet(prev => ({
            ...prev,
            address: accounts[0]
          }));
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        const newNetwork = networkMap[chainId] || networkMap['0x1'];
        setWallet(prev => ({
          ...prev,
          network: {
            ...newNetwork,
            gasPrice: prev.network?.gasPrice || 0,
            blockNumber: prev.network?.blockNumber || 0
          }
        }));
      });

      setIsConnecting(false);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert(`Failed to connect wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    // Remove event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
    }
    
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
        className={`flex items-center space-x-2 text-white rounded-lg transition-colors ${
          variant === 'landing'
            ? 'px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-500'
            : 'px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400'
        } ${
          size === 'large' ? 'text-lg font-semibold' : 'text-sm font-medium'
        }`}
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
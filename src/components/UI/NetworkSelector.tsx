import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

const networks = [
  { 
    id: 1, 
    name: 'Ethereum', 
    symbol: 'ETH', 
    color: 'bg-blue-500',
    chainId: '0x1',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  { 
    id: 56, 
    name: 'BSC', 
    symbol: 'BNB', 
    color: 'bg-yellow-500',
    chainId: '0x38',
    rpcUrl: 'https://bsc-dataseed1.binance.org/',
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  { 
    id: 137, 
    name: 'Polygon', 
    symbol: 'MATIC', 
    color: 'bg-purple-500',
    chainId: '0x89',
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  { 
    id: 42161, 
    name: 'Arbitrum', 
    symbol: 'ETH', 
    color: 'bg-blue-400',
    chainId: '0xa4b1',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
];

const NetworkSelector: React.FC = () => {
  const { wallet, setWallet } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  
  const currentNetwork = networks.find(n => n.id === wallet.network?.chainId) || networks[0];

  const switchNetwork = async (network: typeof networks[0]) => {
    if (!window.ethereum) {
      alert('MetaMask is not installed. Please install MetaMask to switch networks.');
      return;
    }

    if (network.id === currentNetwork.id) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    setIsOpen(false);

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }],
      });

      // Get updated balance after network switch
      const accounts = await window.ethereum.request({
        method: 'eth_accounts',
      });

      if (accounts.length > 0) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest'],
        });

        const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

        // Update wallet state with new network and balance
        setWallet(prev => ({
          ...prev,
          balance: balanceInEth,
          network: {
            chainId: network.id,
            name: network.name,
            symbol: network.symbol,
            rpcUrl: network.rpcUrl,
            blockExplorer: network.blockExplorer,
            gasPrice: 0,
            blockNumber: 0,
          }
        }));
      }

    } catch (switchError: any) {
      console.error('Switch error:', switchError);
      
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: network.chainId,
                chainName: network.name,
                rpcUrls: [network.rpcUrl],
                nativeCurrency: network.nativeCurrency,
                blockExplorerUrls: [network.blockExplorer],
              },
            ],
          });

          // After adding, try to get balance
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          });

          if (accounts.length > 0) {
            const balance = await window.ethereum.request({
              method: 'eth_getBalance',
              params: [accounts[0], 'latest'],
            });

            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

            // Update wallet state after adding network
            setWallet(prev => ({
              ...prev,
              balance: balanceInEth,
              network: {
                chainId: network.id,
                name: network.name,
                symbol: network.symbol,
                rpcUrl: network.rpcUrl,
                blockExplorer: network.blockExplorer,
                gasPrice: 0,
                blockNumber: 0,
              }
            }));
          }

        } catch (addError) {
          console.error('Failed to add network:', addError);
          alert(`Failed to add ${network.name} network. Please add it manually in MetaMask.`);
        }
      } else if (switchError.code === 4001) {
        // User rejected the request
        console.log('User rejected network switch');
      } else {
        console.error('Failed to switch network:', switchError);
        alert(`Failed to switch to ${network.name}. Please try again or switch manually in MetaMask.`);
      }
    } finally {
      setIsSwitching(false);
    }
  };

  if (!wallet.connected) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {isSwitching ? 'Switching...' : currentNetwork.name}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
                Select Network
              </div>
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => switchNetwork(network)}
                  disabled={isSwitching}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentNetwork.id === network.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full ${network.color} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{network.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {network.symbol} • Chain ID: {network.id}
                    </div>
                  </div>
                  {currentNetwork.id === network.id && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1 mb-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full" />
                  <span>Network switching requires MetaMask approval</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  <span>Balance will update after switching</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NetworkSelector;
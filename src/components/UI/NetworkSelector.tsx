import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { useStore } from '../../store/useStore';

const networks = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', color: 'bg-blue-500' },
  { id: 56, name: 'BSC', symbol: 'BNB', color: 'bg-yellow-500' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', color: 'bg-purple-500' },
  { id: 42161, name: 'Arbitrum', symbol: 'ETH', color: 'bg-blue-400' },
];

const NetworkSelector: React.FC = () => {
  const { wallet } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentNetwork = networks.find(n => n.id === wallet.network?.chainId) || networks[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
      >
        <div className={`w-3 h-3 rounded-full ${currentNetwork.color}`} />
        <span className="text-sm font-medium text-gray-900 dark:text-white">
          {currentNetwork.name}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {networks.map((network) => (
            <button
              key={network.id}
              onClick={() => {
                setIsOpen(false);
                // Handle network switch
              }}
              className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              <div className={`w-3 h-3 rounded-full ${network.color}`} />
              <span className="text-sm text-gray-900 dark:text-white">
                {network.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NetworkSelector;
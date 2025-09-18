import React, { useState, useEffect } from "react";
import { Wallet, ChevronDown } from "lucide-react";
import { useStore } from "../../store/useStore";

interface WalletButtonProps {
  variant?: "default" | "landing";
  size?: "default" | "large";
}

const WalletButton: React.FC<WalletButtonProps> = ({
  variant = "default",
  size = "default",
}) => {
  const { wallet, setWallet, setHasEverConnected } = useStore();
  const [isConnecting, setIsConnecting] = useState(false);

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected - only reset if they actually disconnected
          setWallet({
            address: null,
            balance: 0,
            network: null,
            connected: false,
          });
        } else if (accounts[0] !== wallet.address) {
          // Account changed, update balance but maintain connection
          try {
            const balance = await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });
            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

            setWallet((prev) => ({
              ...prev,
              address: accounts[0],
              balance: balanceInEth,
              connected: true, // Ensure connected state is maintained
            }));
          } catch (error) {
            console.error("Failed to get balance:", error);
          }
        }
      };

      const handleChainChanged = async (chainId: string) => {
        // Update network info when chain changes
        const networkId = parseInt(chainId, 16);
        const networkMap: Record<number, any> = {
          1: { name: "Ethereum", symbol: "ETH" },
          56: { name: "BSC", symbol: "BNB" },
          137: { name: "Polygon", symbol: "MATIC" },
          42161: { name: "Arbitrum", symbol: "ETH" },
        };

        const network = networkMap[networkId] || {
          name: "Unknown",
          symbol: "ETH",
        };

        // Get updated balance after network change
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const balance = await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });
            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);

            setWallet((prev) => ({
              ...prev,
              address: accounts[0],
              connected: true, // Ensure connected state is maintained
              balance: balanceInEth,
              network: {
                chainId: networkId,
                name: network.name,
                symbol: network.symbol,
                rpcUrl: "",
                blockExplorer: "",
                gasPrice: 0,
                blockNumber: 0,
              },
            }));
          }
        } catch (error) {
          console.error(
            "Failed to update balance after network change:",
            error,
          );
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged,
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [wallet.address, setWallet]);

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            // Wallet is already connected
            const chainId = await window.ethereum.request({
              method: "eth_chainId",
            });
            const balance = await window.ethereum.request({
              method: "eth_getBalance",
              params: [accounts[0], "latest"],
            });

            const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
            const networkId = parseInt(chainId, 16);

            const networkMap: Record<number, any> = {
              1: { name: "Ethereum", symbol: "ETH" },
              56: { name: "BSC", symbol: "BNB" },
              137: { name: "Polygon", symbol: "MATIC" },
              42161: { name: "Arbitrum", symbol: "ETH" },
            };

            const network = networkMap[networkId] || {
              name: "Unknown",
              symbol: "ETH",
            };

            setWallet({
              address: accounts[0],
              balance: balanceInEth,
              network: {
                chainId: networkId,
                name: network.name,
                symbol: network.symbol,
                rpcUrl: "",
                blockExplorer: "",
                gasPrice: 0,
                blockNumber: 0,
              },
              connected: true,
            });
            setHasEverConnected(true);
          }
        } catch (error) {
          console.error("Failed to check existing connection:", error);
        }
      }
    };

    checkConnection();
  }, [setWallet, setHasEverConnected]);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Get current network
      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Get balance
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });

      const balanceInEth = parseInt(balance, 16) / Math.pow(10, 18);
      const networkId = parseInt(chainId, 16);

      // Map network ID to network info
      const networkMap: Record<number, any> = {
        1: { name: "Ethereum", symbol: "ETH" },
        56: { name: "BSC", symbol: "BNB" },
        137: { name: "Polygon", symbol: "MATIC" },
        42161: { name: "Arbitrum", symbol: "ETH" },
      };

      const network = networkMap[networkId] || {
        name: "Unknown",
        symbol: "ETH",
      };

      setWallet({
        address: accounts[0],
        balance: balanceInEth,
        network: {
          chainId: networkId,
          name: network.name,
          symbol: network.symbol,
          rpcUrl: "",
          blockExplorer: "",
          gasPrice: 0,
          blockNumber: 0,
        },
        connected: true,
      });

      setHasEverConnected(true);
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      if (error.code === 4001) {
        // User rejected the request
        alert("Please approve the connection request in MetaMask.");
      } else {
        alert("Failed to connect to MetaMask. Please try again.");
      }
    } finally {
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
        className={`flex items-center space-x-2 text-white rounded-lg transition-colors ${
          variant === "landing"
            ? "px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-500"
            : "px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400"
        } ${
          size === "large" ? "text-lg font-semibold" : "text-sm font-medium"
        }`}
      >
        <Wallet className="w-4 h-4" />
        <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
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
            {wallet.balance.toFixed(3)} {wallet.network?.symbol || "ETH"}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            Connected Account
          </div>
          <div className="text-xs font-mono text-gray-600 dark:text-gray-400 break-all mb-2">
            {wallet.address}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Balance: {wallet.balance.toFixed(6)}{" "}
            {wallet.network?.symbol || "ETH"}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Network: {wallet.network?.name || "Unknown"}
          </div>
        </div>
        <div className="p-2">
          <button
            onClick={disconnectWallet}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            Disconnect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default WalletButton;

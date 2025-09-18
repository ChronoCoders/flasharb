import { useState, useCallback } from "react";
import { ethers } from "ethers";
import { useStore } from "../store/useStore";
import { ArbitrageOpportunity } from "../types";

// Contract ABIs (simplified for demo)
const ARBITRAGE_ABI = [
  "function executeArbitrage(address asset, uint256 amount, tuple(address tokenA, address tokenB, uint256 flashAmount, address[] exchanges, bytes[] swapData, uint256 minProfit) params) external",
  "function getBalance(address token) external view returns (uint256)",
  "function withdrawProfits(address token, uint256 amount) external",
  "function emergencyWithdraw(address token) external",
  "function pause() external",
  "function unpause() external",
  "event ArbitrageExecuted(address indexed tokenA, address indexed tokenB, uint256 flashAmount, uint256 profit, address indexed executor)",
];

const DEX_AGGREGATOR_ABI = [
  "function getBestPrice(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 bestAmountOut, string memory bestDex)",
  "function swapV2(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address router) external returns (uint256)",
  "function swapV3(uint256 amountIn, uint256 amountOutMin, address tokenIn, address tokenOut, uint24 fee) external returns (uint256)",
];

const RISK_MANAGER_ABI = [
  "function isTradeAllowed(address user, uint256 tradeSize, uint256 expectedProfit, uint256 slippage) external returns (bool)",
  "function calculateRiskScore(uint256 tradeSize, uint256 gasPrice, uint256 slippage, uint256 priceDeviation) external view returns (uint256)",
  "function getUserRiskStatus(address user) external view returns (uint256, uint256, uint256, bool)",
];

// Contract addresses (would be deployed addresses)
const CONTRACT_ADDRESSES = {
  arbitrageBot: "0x1234567890123456789012345678901234567890",
  dexAggregator: "0x2345678901234567890123456789012345678901",
  riskManager: "0x3456789012345678901234567890123456789012",
  priceOracle: "0x4567890123456789012345678901234567890123",
};

export const useArbitrageContract = () => {
  const { wallet } = useStore();
  const [isExecuting, setIsExecuting] = useState(false);
  const [contractBalance, setContractBalance] = useState<
    Record<string, number>
  >({});

  const getProvider = useCallback(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    throw new Error("No ethereum provider found");
  }, []);

  const getContract = useCallback(
    (address: string, abi: string[]) => {
      const provider = getProvider();
      return new ethers.Contract(address, abi, provider);
    },
    [getProvider],
  );

  const getSignedContract = useCallback(
    async (address: string, abi: string[]) => {
      const provider = getProvider();
      const signer = await provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    },
    [getProvider],
  );

  const executeArbitrage = useCallback(
    async (opportunity: ArbitrageOpportunity) => {
      if (!wallet.connected) {
        throw new Error("Wallet not connected");
      }

      setIsExecuting(true);

      try {
        // Get contracts
        const arbitrageContract = await getSignedContract(
          CONTRACT_ADDRESSES.arbitrageBot,
          ARBITRAGE_ABI,
        );

        const riskManager = await getSignedContract(
          CONTRACT_ADDRESSES.riskManager,
          RISK_MANAGER_ABI,
        );

        // Validate trade with risk manager
        const isAllowed = await riskManager.isTradeAllowed(
          wallet.address,
          ethers.parseEther(opportunity.amount.toString()),
          ethers.parseEther(opportunity.netProfit.toString()),
          opportunity.slippage || 300, // 3% default slippage
        );

        if (!isAllowed) {
          throw new Error("Trade not allowed by risk manager");
        }

        // Prepare arbitrage parameters
        const params = {
          tokenA: opportunity.tokenA,
          tokenB: opportunity.tokenB,
          flashAmount: ethers.parseEther(opportunity.amount.toString()),
          exchanges: opportunity.exchanges.map((ex) => getExchangeAddress(ex)),
          swapData: await generateSwapData(opportunity),
          minProfit: ethers.parseEther(
            (opportunity.netProfit * 0.95).toString(),
          ), // 5% slippage on profit
        };

        // Execute arbitrage
        const tx = await arbitrageContract.executeArbitrage(
          opportunity.tokenA,
          ethers.parseEther(opportunity.amount.toString()),
          params,
          {
            gasLimit: 500000,
            gasPrice: ethers.parseUnits("20", "gwei"),
          },
        );

        console.log("Transaction submitted:", tx.hash);

        // Wait for confirmation
        const receipt = await tx.wait();
        console.log("Transaction confirmed:", receipt);

        return {
          hash: tx.hash,
          success: receipt.status === 1,
          gasUsed: receipt.gasUsed.toString(),
          blockNumber: receipt.blockNumber,
        };
      } catch (error) {
        console.error("Arbitrage execution failed:", error);
        throw error;
      } finally {
        setIsExecuting(false);
      }
    },
    [wallet, getSignedContract],
  );

  const getBestPrice = useCallback(
    async (tokenIn: string, tokenOut: string, amountIn: string) => {
      try {
        const dexAggregator = getContract(
          CONTRACT_ADDRESSES.dexAggregator,
          DEX_AGGREGATOR_ABI,
        );

        const [bestAmountOut, bestDex] = await dexAggregator.getBestPrice(
          tokenIn,
          tokenOut,
          ethers.parseEther(amountIn),
        );

        return {
          amountOut: ethers.formatEther(bestAmountOut),
          bestDex,
        };
      } catch (error) {
        console.error("Failed to get best price:", error);
        throw error;
      }
    },
    [getContract],
  );

  const getContractBalance = useCallback(
    async (tokenAddress: string) => {
      try {
        const arbitrageContract = getContract(
          CONTRACT_ADDRESSES.arbitrageBot,
          ARBITRAGE_ABI,
        );

        const balance = await arbitrageContract.getBalance(tokenAddress);
        return ethers.formatEther(balance);
      } catch (error) {
        console.error("Failed to get contract balance:", error);
        return "0";
      }
    },
    [getContract],
  );

  const withdrawProfits = useCallback(
    async (tokenAddress: string, amount: string) => {
      try {
        const arbitrageContract = await getSignedContract(
          CONTRACT_ADDRESSES.arbitrageBot,
          ARBITRAGE_ABI,
        );

        const tx = await arbitrageContract.withdrawProfits(
          tokenAddress,
          ethers.parseEther(amount),
        );

        await tx.wait();
        return tx.hash;
      } catch (error) {
        console.error("Failed to withdraw profits:", error);
        throw error;
      }
    },
    [getSignedContract],
  );

  const getRiskStatus = useCallback(async () => {
    if (!wallet.connected) return null;

    try {
      const riskManager = getContract(
        CONTRACT_ADDRESSES.riskManager,
        RISK_MANAGER_ABI,
      );

      const [currentDailyLoss, remainingDailyLimit, todayTradeCount, canTrade] =
        await riskManager.getUserRiskStatus(wallet.address);

      return {
        currentDailyLoss: ethers.formatEther(currentDailyLoss),
        remainingDailyLimit: ethers.formatEther(remainingDailyLimit),
        todayTradeCount: todayTradeCount.toString(),
        canTrade,
      };
    } catch (error) {
      console.error("Failed to get risk status:", error);
      return null;
    }
  }, [wallet.address, getContract]);

  const pauseContract = useCallback(async () => {
    try {
      const arbitrageContract = await getSignedContract(
        CONTRACT_ADDRESSES.arbitrageBot,
        ARBITRAGE_ABI,
      );

      const tx = await arbitrageContract.pause();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to pause contract:", error);
      throw error;
    }
  }, [getSignedContract]);

  return {
    executeArbitrage,
    getBestPrice,
    getContractBalance,
    withdrawProfits,
    getRiskStatus,
    pauseContract,
    isExecuting,
    contractBalance,
  };
};

// Helper functions
const getExchangeAddress = (exchangeName: string): string => {
  const addresses: Record<string, string> = {
    "Uniswap V2": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    "Uniswap V3": "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    SushiSwap: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    "1inch": "0x1111111254fb6c44bAC0beD2854e76F90643097d",
  };

  return addresses[exchangeName] || addresses["Uniswap V2"];
};

const generateSwapData = async (
  opportunity: ArbitrageOpportunity,
): Promise<string[]> => {
  // This would generate the actual swap calldata for each exchange
  // For demo purposes, returning empty bytes
  return opportunity.exchanges.map(() => "0x");
};

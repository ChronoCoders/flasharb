// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RiskManager
 * @dev Risk management contract for arbitrage operations
 */
contract RiskManager is Ownable {
    
    // Risk parameters
    uint256 public maxSlippage = 300; // 3% in basis points
    uint256 public maxGasPrice = 100 gwei;
    uint256 public maxTradeSize = 1000 ether;
    uint256 public maxDailyLoss = 100 ether;
    uint256 public minProfitThreshold = 50; // 0.5% in basis points
    
    // Daily tracking
    mapping(address => uint256) public dailyLosses;
    mapping(address => uint256) public lastLossReset;
    mapping(address => uint256) public tradeCount;
    mapping(address => uint256) public lastTradeReset;
    
    // Events
    event RiskParametersUpdated(
        uint256 maxSlippage,
        uint256 maxGasPrice,
        uint256 maxTradeSize,
        uint256 maxDailyLoss
    );
    
    event RiskViolation(
        address indexed user,
        string riskType,
        uint256 value,
        uint256 limit
    );

    /**
     * @dev Calculate maximum allowed slippage
     */
    function calculateMaxSlippage(
        uint256 amount,
        uint256 expectedOutput
    ) external view returns (uint256) {
        require(expectedOutput > 0, "Invalid expected output");
        
        uint256 maxSlippageAmount = (expectedOutput * maxSlippage) / 10000;
        uint256 minOutput = expectedOutput - maxSlippageAmount;
        
        return minOutput;
    }

    /**
     * @dev Validate current gas price
     */
    function validateGasPrice() external view returns (bool) {
        return tx.gasprice <= maxGasPrice;
    }

    /**
     * @dev Validate trade size
     */
    function validateTradeSize(uint256 amount) external view returns (bool) {
        return amount <= maxTradeSize;
    }

    /**
     * @dev Check daily loss limits
     */
    function checkDailyLimits(address user) external returns (bool) {
        // Reset daily counters if needed
        if (block.timestamp > lastLossReset[user] + 1 days) {
            dailyLosses[user] = 0;
            lastLossReset[user] = block.timestamp;
        }
        
        return dailyLosses[user] < maxDailyLoss;
    }

    /**
     * @dev Record a loss
     */
    function recordLoss(address user, uint256 amount) external onlyOwner {
        if (block.timestamp > lastLossReset[user] + 1 days) {
            dailyLosses[user] = 0;
            lastLossReset[user] = block.timestamp;
        }
        
        dailyLosses[user] += amount;
        
        if (dailyLosses[user] >= maxDailyLoss) {
            emit RiskViolation(user, "DailyLoss", dailyLosses[user], maxDailyLoss);
        }
    }

    /**
     * @dev Validate profit threshold
     */
    function validateProfitThreshold(
        uint256 profit,
        uint256 investment
    ) external view returns (bool) {
        uint256 profitPercentage = (profit * 10000) / investment;
        return profitPercentage >= minProfitThreshold;
    }

    /**
     * @dev Calculate risk score for a trade
     */
    function calculateRiskScore(
        uint256 tradeSize,
        uint256 gasPrice,
        uint256 slippage,
        uint256 priceDeviation
    ) external view returns (uint256 riskScore) {
        uint256 sizeRisk = (tradeSize * 100) / maxTradeSize;
        uint256 gasRisk = (gasPrice * 100) / maxGasPrice;
        uint256 slippageRisk = (slippage * 100) / maxSlippage;
        uint256 priceRisk = priceDeviation; // Already in percentage
        
        riskScore = (sizeRisk + gasRisk + slippageRisk + priceRisk) / 4;
        
        return riskScore;
    }

    /**
     * @dev Check if trade is within risk limits
     */
    function isTradeAllowed(
        address user,
        uint256 tradeSize,
        uint256 expectedProfit,
        uint256 slippage
    ) external returns (bool) {
        // Check trade size
        if (!validateTradeSize(tradeSize)) {
            emit RiskViolation(user, "TradeSize", tradeSize, maxTradeSize);
            return false;
        }
        
        // Check gas price
        if (!validateGasPrice()) {
            emit RiskViolation(user, "GasPrice", tx.gasprice, maxGasPrice);
            return false;
        }
        
        // Check slippage
        if (slippage > maxSlippage) {
            emit RiskViolation(user, "Slippage", slippage, maxSlippage);
            return false;
        }
        
        // Check daily limits
        if (!checkDailyLimits(user)) {
            emit RiskViolation(user, "DailyLoss", dailyLosses[user], maxDailyLoss);
            return false;
        }
        
        // Check profit threshold
        if (!validateProfitThreshold(expectedProfit, tradeSize)) {
            emit RiskViolation(user, "ProfitThreshold", expectedProfit, minProfitThreshold);
            return false;
        }
        
        return true;
    }

    /**
     * @dev Update risk parameters
     */
    function updateRiskParameters(
        uint256 _maxSlippage,
        uint256 _maxGasPrice,
        uint256 _maxTradeSize,
        uint256 _maxDailyLoss,
        uint256 _minProfitThreshold
    ) external onlyOwner {
        maxSlippage = _maxSlippage;
        maxGasPrice = _maxGasPrice;
        maxTradeSize = _maxTradeSize;
        maxDailyLoss = _maxDailyLoss;
        minProfitThreshold = _minProfitThreshold;
        
        emit RiskParametersUpdated(maxSlippage, maxGasPrice, maxTradeSize, maxDailyLoss);
    }

    /**
     * @dev Get user's current risk status
     */
    function getUserRiskStatus(address user) external view returns (
        uint256 currentDailyLoss,
        uint256 remainingDailyLimit,
        uint256 todayTradeCount,
        bool canTrade
    ) {
        currentDailyLoss = dailyLosses[user];
        remainingDailyLimit = maxDailyLoss > currentDailyLoss ? 
            maxDailyLoss - currentDailyLoss : 0;
        
        // Calculate today's trade count
        if (block.timestamp > lastTradeReset[user] + 1 days) {
            todayTradeCount = 0;
        } else {
            todayTradeCount = tradeCount[user];
        }
        
        canTrade = remainingDailyLimit > 0 && validateGasPrice();
        
        return (currentDailyLoss, remainingDailyLimit, todayTradeCount, canTrade);
    }

    /**
     * @dev Emergency stop function
     */
    function emergencyStop() external onlyOwner {
        maxTradeSize = 0;
        maxDailyLoss = 0;
    }

    /**
     * @dev Resume operations
     */
    function resumeOperations(
        uint256 _maxTradeSize,
        uint256 _maxDailyLoss
    ) external onlyOwner {
        maxTradeSize = _maxTradeSize;
        maxDailyLoss = _maxDailyLoss;
    }
}
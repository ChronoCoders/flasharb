// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PriceOracle
 * @dev Price oracle for validating arbitrage opportunities
 */
contract PriceOracle is Ownable {
    
    // Chainlink price feeds
    mapping(address => AggregatorV3Interface) public priceFeeds;
    
    // Events
    event PriceFeedUpdated(address indexed token, address indexed priceFeed);
    event OpportunityValidated(
        address indexed tokenA,
        address indexed tokenB,
        bool profitable,
        uint256 expectedProfit
    );

    /**
     * @dev Set price feed for a token
     */
    function setPriceFeed(address token, address priceFeed) external onlyOwner {
        priceFeeds[token] = AggregatorV3Interface(priceFeed);
        emit PriceFeedUpdated(token, priceFeed);
    }

    /**
     * @dev Get Chainlink price for a token
     */
    function getChainlinkPrice(address token) external view returns (uint256) {
        AggregatorV3Interface priceFeed = priceFeeds[token];
        require(address(priceFeed) != address(0), "Price feed not set");
        
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        require(timeStamp > 0, "Round not complete");
        require(price > 0, "Invalid price");
        
        // Chainlink prices are typically 8 decimals, normalize to 18
        uint8 decimals = priceFeed.decimals();
        return uint256(price) * (10 ** (18 - decimals));
    }

    /**
     * @dev Validate arbitrage opportunity
     */
    function validateOpportunity(
        address tokenA,
        address tokenB,
        uint256 amount,
        address[] calldata exchanges,
        uint256[] calldata expectedPrices
    ) external returns (bool profitable, uint256 expectedProfit) {
        require(exchanges.length >= 2, "Need at least 2 exchanges");
        require(exchanges.length == expectedPrices.length, "Mismatched arrays");
        
        // Get current market prices
        uint256 priceA = getChainlinkPrice(tokenA);
        uint256 priceB = getChainlinkPrice(tokenB);
        
        // Calculate expected profit based on price differences
        uint256 maxPrice = 0;
        uint256 minPrice = type(uint256).max;
        
        for (uint256 i = 0; i < expectedPrices.length; i++) {
            if (expectedPrices[i] > maxPrice) {
                maxPrice = expectedPrices[i];
            }
            if (expectedPrices[i] < minPrice) {
                minPrice = expectedPrices[i];
            }
        }
        
        // Calculate profit potential
        if (maxPrice > minPrice) {
            expectedProfit = ((maxPrice - minPrice) * amount) / minPrice;
            profitable = expectedProfit > (amount * 50) / 10000; // 0.5% minimum profit
        } else {
            profitable = false;
            expectedProfit = 0;
        }
        
        emit OpportunityValidated(tokenA, tokenB, profitable, expectedProfit);
        
        return (profitable, expectedProfit);
    }

    /**
     * @dev Calculate price impact for large trades
     */
    function calculatePriceImpact(
        address token,
        uint256 tradeSize,
        uint256 liquidity
    ) external pure returns (uint256 priceImpact) {
        require(liquidity > 0, "Invalid liquidity");
        
        // Simple price impact calculation: impact = tradeSize / liquidity
        priceImpact = (tradeSize * 10000) / liquidity; // in basis points
        
        return priceImpact;
    }

    /**
     * @dev Get price deviation from oracle
     */
    function getPriceDeviation(
        address token,
        uint256 marketPrice
    ) external view returns (uint256 deviation) {
        uint256 oraclePrice = getChainlinkPrice(token);
        
        if (marketPrice > oraclePrice) {
            deviation = ((marketPrice - oraclePrice) * 10000) / oraclePrice;
        } else {
            deviation = ((oraclePrice - marketPrice) * 10000) / oraclePrice;
        }
        
        return deviation; // in basis points
    }

    /**
     * @dev Check if price is within acceptable range
     */
    function isPriceValid(
        address token,
        uint256 marketPrice,
        uint256 maxDeviation
    ) external view returns (bool) {
        uint256 deviation = this.getPriceDeviation(token, marketPrice);
        return deviation <= maxDeviation;
    }
}
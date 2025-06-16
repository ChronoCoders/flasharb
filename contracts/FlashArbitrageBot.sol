// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol";
import "@aave/core-v3/contracts/interfaces/IPool.sol";
import "@aave/core-v3/contracts/flashloan/interfaces/IFlashLoanReceiver.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title FlashArbitrageBot
 * @dev Main contract for executing flash loan arbitrage across DEXs
 */
contract FlashArbitrageBot is IFlashLoanReceiver, Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IPoolAddressesProvider public immutable ADDRESSES_PROVIDER;
    IPool public immutable POOL;

    // Events
    event ArbitrageExecuted(
        address indexed tokenA,
        address indexed tokenB,
        uint256 flashAmount,
        uint256 profit,
        address indexed executor
    );
    
    event EmergencyWithdraw(address indexed token, uint256 amount);
    event ProfitWithdrawn(address indexed token, uint256 amount);

    // Structs
    struct ArbitrageParams {
        address tokenA;
        address tokenB;
        uint256 flashAmount;
        address[] exchanges;
        bytes[] swapData;
        uint256 minProfit;
    }

    // State variables
    mapping(address => bool) public authorizedExecutors;
    mapping(address => uint256) public dailyLosses;
    mapping(address => uint256) public lastLossReset;
    
    uint256 public maxDailyLoss = 1000 ether; // 1000 tokens max daily loss
    uint256 public maxSlippage = 300; // 3% max slippage (basis points)
    uint256 public minProfitThreshold = 50; // 0.5% min profit (basis points)

    modifier onlyAuthorized() {
        require(authorizedExecutors[msg.sender] || msg.sender == owner(), "Not authorized");
        _;
    }

    constructor(address _addressProvider) {
        ADDRESSES_PROVIDER = IPoolAddressesProvider(_addressProvider);
        POOL = IPool(IPoolAddressesProvider(_addressProvider).getPool());
        authorizedExecutors[msg.sender] = true;
    }

    /**
     * @dev Execute arbitrage using flash loan
     */
    function executeArbitrage(
        address asset,
        uint256 amount,
        ArbitrageParams calldata params
    ) external onlyAuthorized whenNotPaused nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(params.exchanges.length >= 2, "Need at least 2 exchanges");
        
        // Check daily loss limits
        _checkDailyLimits(asset);
        
        // Prepare flash loan
        address[] memory assets = new address[](1);
        assets[0] = asset;
        
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;
        
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0; // No debt mode
        
        bytes memory encodedParams = abi.encode(params);
        
        // Execute flash loan
        POOL.flashLoan(
            address(this),
            assets,
            amounts,
            modes,
            address(this),
            encodedParams,
            0
        );
    }

    /**
     * @dev Flash loan callback - executes arbitrage logic
     */
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Caller must be Pool");
        require(initiator == address(this), "Initiator must be this contract");
        
        ArbitrageParams memory arbParams = abi.decode(params, (ArbitrageParams));
        
        uint256 initialBalance = IERC20(assets[0]).balanceOf(address(this));
        uint256 flashAmount = amounts[0];
        uint256 premium = premiums[0];
        uint256 totalDebt = flashAmount + premium;
        
        // Execute arbitrage swaps
        _executeArbitrageSwaps(arbParams, flashAmount);
        
        uint256 finalBalance = IERC20(assets[0]).balanceOf(address(this));
        require(finalBalance >= totalDebt, "Arbitrage not profitable");
        
        uint256 profit = finalBalance - totalDebt;
        require(profit >= arbParams.minProfit, "Profit below threshold");
        
        // Approve repayment
        IERC20(assets[0]).safeApprove(address(POOL), totalDebt);
        
        emit ArbitrageExecuted(
            arbParams.tokenA,
            arbParams.tokenB,
            flashAmount,
            profit,
            tx.origin
        );
        
        return true;
    }

    /**
     * @dev Execute the actual arbitrage swaps
     */
    function _executeArbitrageSwaps(
        ArbitrageParams memory params,
        uint256 amount
    ) internal {
        require(params.exchanges.length == params.swapData.length, "Mismatched arrays");
        
        for (uint256 i = 0; i < params.exchanges.length; i++) {
            address exchange = params.exchanges[i];
            bytes memory swapData = params.swapData[i];
            
            // Execute swap on exchange
            (bool success, ) = exchange.call(swapData);
            require(success, "Swap failed");
        }
    }

    /**
     * @dev Check daily loss limits
     */
    function _checkDailyLimits(address token) internal {
        if (block.timestamp > lastLossReset[token] + 1 days) {
            dailyLosses[token] = 0;
            lastLossReset[token] = block.timestamp;
        }
        
        require(dailyLosses[token] < maxDailyLoss, "Daily loss limit exceeded");
    }

    /**
     * @dev Set authorized executor
     */
    function setAuthorizedExecutor(address executor, bool authorized) external onlyOwner {
        authorizedExecutors[executor] = authorized;
    }

    /**
     * @dev Update risk parameters
     */
    function updateRiskParams(
        uint256 _maxDailyLoss,
        uint256 _maxSlippage,
        uint256 _minProfitThreshold
    ) external onlyOwner {
        maxDailyLoss = _maxDailyLoss;
        maxSlippage = _maxSlippage;
        minProfitThreshold = _minProfitThreshold;
    }

    /**
     * @dev Emergency withdraw function
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        require(balance > 0, "No balance to withdraw");
        
        IERC20(token).safeTransfer(owner(), balance);
        emit EmergencyWithdraw(token, balance);
    }

    /**
     * @dev Withdraw profits
     */
    function withdrawProfits(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).safeTransfer(owner(), amount);
        emit ProfitWithdrawn(token, amount);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get contract balance
     */
    function getBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    // Required by IFlashLoanReceiver
    function ADDRESSES_PROVIDER() external view override returns (IPoolAddressesProvider) {
        return ADDRESSES_PROVIDER;
    }

    function POOL() external view override returns (IPool) {
        return POOL;
    }
}
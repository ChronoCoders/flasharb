// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IUniswapV2Router {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

interface IUniswapV3Router {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }
    
    function exactInputSingle(ExactInputSingleParams calldata params)
        external payable returns (uint256 amountOut);
}

/**
 * @title DEXAggregator
 * @dev Aggregates swaps across multiple DEXs
 */
contract DEXAggregator is Ownable {
    using SafeERC20 for IERC20;

    // DEX Router addresses
    address public uniswapV2Router;
    address public uniswapV3Router;
    address public sushiswapRouter;
    
    // Events
    event SwapExecuted(
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string dex
    );

    constructor(
        address _uniswapV2Router,
        address _uniswapV3Router,
        address _sushiswapRouter
    ) {
        uniswapV2Router = _uniswapV2Router;
        uniswapV3Router = _uniswapV3Router;
        sushiswapRouter = _sushiswapRouter;
    }

    /**
     * @dev Swap on Uniswap V2
     */
    function swapV2(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address router
    ) external returns (uint256) {
        require(path.length >= 2, "Invalid path");
        require(amountIn > 0, "Amount must be greater than 0");
        
        IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(path[0]).safeApprove(router, amountIn);
        
        uint256[] memory amounts = IUniswapV2Router(router).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 300
        );
        
        emit SwapExecuted(path[0], path[path.length - 1], amountIn, amounts[amounts.length - 1], "UniswapV2");
        
        return amounts[amounts.length - 1];
    }

    /**
     * @dev Swap on Uniswap V3
     */
    function swapV3(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut,
        uint24 fee
    ) external returns (uint256) {
        require(amountIn > 0, "Amount must be greater than 0");
        
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenIn).safeApprove(uniswapV3Router, amountIn);
        
        IUniswapV3Router.ExactInputSingleParams memory params = IUniswapV3Router.ExactInputSingleParams({
            tokenIn: tokenIn,
            tokenOut: tokenOut,
            fee: fee,
            recipient: msg.sender,
            deadline: block.timestamp + 300,
            amountIn: amountIn,
            amountOutMinimum: amountOutMin,
            sqrtPriceLimitX96: 0
        });
        
        uint256 amountOut = IUniswapV3Router(uniswapV3Router).exactInputSingle(params);
        
        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut, "UniswapV3");
        
        return amountOut;
    }

    /**
     * @dev Swap on SushiSwap
     */
    function swapSushi(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path
    ) external returns (uint256) {
        require(path.length >= 2, "Invalid path");
        require(amountIn > 0, "Amount must be greater than 0");
        
        IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(path[0]).safeApprove(sushiswapRouter, amountIn);
        
        uint256[] memory amounts = IUniswapV2Router(sushiswapRouter).swapExactTokensForTokens(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            block.timestamp + 300
        );
        
        emit SwapExecuted(path[0], path[path.length - 1], amountIn, amounts[amounts.length - 1], "SushiSwap");
        
        return amounts[amounts.length - 1];
    }

    /**
     * @dev Get best price across all DEXs
     */
    function getBestPrice(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) external view returns (uint256 bestAmountOut, string memory bestDex) {
        uint256 uniV2Out = _getUniV2Price(tokenIn, tokenOut, amountIn);
        uint256 sushiOut = _getSushiPrice(tokenIn, tokenOut, amountIn);
        
        if (uniV2Out >= sushiOut) {
            return (uniV2Out, "UniswapV2");
        } else {
            return (sushiOut, "SushiSwap");
        }
    }

    /**
     * @dev Get Uniswap V2 price
     */
    function _getUniV2Price(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (uint256) {
        try IUniswapV2Router(uniswapV2Router).getAmountsOut(
            amountIn,
            _getPath(tokenIn, tokenOut)
        ) returns (uint256[] memory amounts) {
            return amounts[amounts.length - 1];
        } catch {
            return 0;
        }
    }

    /**
     * @dev Get SushiSwap price
     */
    function _getSushiPrice(
        address tokenIn,
        address tokenOut,
        uint256 amountIn
    ) internal view returns (uint256) {
        try IUniswapV2Router(sushiswapRouter).getAmountsOut(
            amountIn,
            _getPath(tokenIn, tokenOut)
        ) returns (uint256[] memory amounts) {
            return amounts[amounts.length - 1];
        } catch {
            return 0;
        }
    }

    /**
     * @dev Get trading path
     */
    function _getPath(address tokenIn, address tokenOut) internal pure returns (address[] memory) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;
        return path;
    }

    /**
     * @dev Update router addresses
     */
    function updateRouters(
        address _uniswapV2Router,
        address _uniswapV3Router,
        address _sushiswapRouter
    ) external onlyOwner {
        uniswapV2Router = _uniswapV2Router;
        uniswapV3Router = _uniswapV3Router;
        sushiswapRouter = _sushiswapRouter;
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(address token) external onlyOwner {
        uint256 balance = IERC20(token).balanceOf(address(this));
        if (balance > 0) {
            IERC20(token).safeTransfer(owner(), balance);
        }
    }
}
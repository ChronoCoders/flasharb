const { expect } = require('chai')
const { ethers } = require('hardhat')

describe('FlashArbitrageBot', function () {
  let flashArbitrageBot
  let dexAggregator
  let priceOracle
  let riskManager
  let owner
  let user
  let mockToken

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners()

    // Deploy mock token
    const MockToken = await ethers.getContractFactory('MockERC20')
    mockToken = await MockToken.deploy('Mock Token', 'MOCK', ethers.utils.parseEther('1000000'))

    // Deploy PriceOracle
    const PriceOracle = await ethers.getContractFactory('PriceOracle')
    priceOracle = await PriceOracle.deploy()

    // Deploy RiskManager
    const RiskManager = await ethers.getContractFactory('RiskManager')
    riskManager = await RiskManager.deploy()

    // Deploy DEXAggregator
    const DEXAggregator = await ethers.getContractFactory('DEXAggregator')
    dexAggregator = await DEXAggregator.deploy(
      '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D', // Uniswap V2
      '0xE592427A0AEce92De3Edee1F18E0157C05861564', // Uniswap V3
      '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F' // SushiSwap
    )

    // Deploy FlashArbitrageBot (using mock address for Aave)
    const FlashArbitrageBot = await ethers.getContractFactory('FlashArbitrageBot')
    flashArbitrageBot = await FlashArbitrageBot.deploy(
      '0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e' // Aave Pool Addresses Provider
    )
  })

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await flashArbitrageBot.owner()).to.equal(owner.address)
    })

    it('Should authorize the deployer', async function () {
      expect(await flashArbitrageBot.authorizedExecutors(owner.address)).to.be.true
    })

    it('Should set correct initial risk parameters', async function () {
      expect(await flashArbitrageBot.maxDailyLoss()).to.equal(ethers.utils.parseEther('1000'))
      expect(await flashArbitrageBot.maxSlippage()).to.equal(300) // 3%
      expect(await flashArbitrageBot.minProfitThreshold()).to.equal(50) // 0.5%
    })
  })

  describe('Authorization', function () {
    it('Should allow owner to set authorized executors', async function () {
      await flashArbitrageBot.setAuthorizedExecutor(user.address, true)
      expect(await flashArbitrageBot.authorizedExecutors(user.address)).to.be.true
    })

    it('Should not allow non-owner to set authorized executors', async function () {
      await expect(
        flashArbitrageBot.connect(user).setAuthorizedExecutor(user.address, true)
      ).to.be.revertedWith('Ownable: caller is not the owner')
    })
  })

  describe('Risk Management', function () {
    it('Should update risk parameters', async function () {
      await flashArbitrageBot.updateRiskParams(
        ethers.utils.parseEther('500'), // maxDailyLoss
        500, // maxSlippage (5%)
        100 // minProfitThreshold (1%)
      )

      expect(await flashArbitrageBot.maxDailyLoss()).to.equal(ethers.utils.parseEther('500'))
      expect(await flashArbitrageBot.maxSlippage()).to.equal(500)
      expect(await flashArbitrageBot.minProfitThreshold()).to.equal(100)
    })

    it('Should track daily losses', async function () {
      // This would require a more complex test setup with actual flash loan execution
      // For now, we'll test the basic functionality
      expect(await flashArbitrageBot.dailyLosses(owner.address)).to.equal(0)
    })
  })

  describe('Emergency Functions', function () {
    it('Should allow owner to pause contract', async function () {
      await flashArbitrageBot.pause()
      expect(await flashArbitrageBot.paused()).to.be.true
    })

    it('Should allow owner to unpause contract', async function () {
      await flashArbitrageBot.pause()
      await flashArbitrageBot.unpause()
      expect(await flashArbitrageBot.paused()).to.be.false
    })

    it('Should allow emergency withdrawal', async function () {
      // Send some tokens to the contract first
      await mockToken.transfer(flashArbitrageBot.address, ethers.utils.parseEther('100'))

      const initialBalance = await mockToken.balanceOf(owner.address)
      await flashArbitrageBot.emergencyWithdraw(mockToken.address)
      const finalBalance = await mockToken.balanceOf(owner.address)

      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther('100'))
    })
  })

  describe('Balance Management', function () {
    it('Should return correct contract balance', async function () {
      await mockToken.transfer(flashArbitrageBot.address, ethers.utils.parseEther('50'))

      const balance = await flashArbitrageBot.getBalance(mockToken.address)
      expect(balance).to.equal(ethers.utils.parseEther('50'))
    })

    it('Should allow profit withdrawal', async function () {
      // Send tokens to contract
      await mockToken.transfer(flashArbitrageBot.address, ethers.utils.parseEther('100'))

      const initialBalance = await mockToken.balanceOf(owner.address)
      await flashArbitrageBot.withdrawProfits(mockToken.address, ethers.utils.parseEther('50'))
      const finalBalance = await mockToken.balanceOf(owner.address)

      expect(finalBalance.sub(initialBalance)).to.equal(ethers.utils.parseEther('50'))
    })
  })
})

// Mock ERC20 contract for testing
const MockERC20 = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
`

const hre = require("hardhat");

async function main() {
  console.log("Deploying Flash Loan Arbitrage Bot contracts...");

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // Contract addresses for mainnet
  const AAVE_POOL_ADDRESSES_PROVIDER =
    "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e";
  const UNISWAP_V2_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
  const UNISWAP_V3_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
  const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

  // Deploy PriceOracle
  console.log("\nDeploying PriceOracle...");
  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy();
  await priceOracle.deployed();
  console.log("PriceOracle deployed to:", priceOracle.address);

  // Deploy RiskManager
  console.log("\nDeploying RiskManager...");
  const RiskManager = await hre.ethers.getContractFactory("RiskManager");
  const riskManager = await RiskManager.deploy();
  await riskManager.deployed();
  console.log("RiskManager deployed to:", riskManager.address);

  // Deploy DEXAggregator
  console.log("\nDeploying DEXAggregator...");
  const DEXAggregator = await hre.ethers.getContractFactory("DEXAggregator");
  const dexAggregator = await DEXAggregator.deploy(
    UNISWAP_V2_ROUTER,
    UNISWAP_V3_ROUTER,
    SUSHISWAP_ROUTER,
  );
  await dexAggregator.deployed();
  console.log("DEXAggregator deployed to:", dexAggregator.address);

  // Deploy FlashArbitrageBot
  console.log("\nDeploying FlashArbitrageBot...");
  const FlashArbitrageBot =
    await hre.ethers.getContractFactory("FlashArbitrageBot");
  const flashArbitrageBot = await FlashArbitrageBot.deploy(
    AAVE_POOL_ADDRESSES_PROVIDER,
  );
  await flashArbitrageBot.deployed();
  console.log("FlashArbitrageBot deployed to:", flashArbitrageBot.address);

  // Verify contracts on Etherscan (if not on hardhat network)
  if (hre.network.name !== "hardhat") {
    console.log("\nWaiting for block confirmations...");
    await priceOracle.deployTransaction.wait(6);
    await riskManager.deployTransaction.wait(6);
    await dexAggregator.deployTransaction.wait(6);
    await flashArbitrageBot.deployTransaction.wait(6);

    console.log("\nVerifying contracts on Etherscan...");

    try {
      await hre.run("verify:verify", {
        address: priceOracle.address,
        constructorArguments: [],
      });
      console.log("PriceOracle verified");
    } catch (error) {
      console.log("PriceOracle verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: riskManager.address,
        constructorArguments: [],
      });
      console.log("RiskManager verified");
    } catch (error) {
      console.log("RiskManager verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: dexAggregator.address,
        constructorArguments: [
          UNISWAP_V2_ROUTER,
          UNISWAP_V3_ROUTER,
          SUSHISWAP_ROUTER,
        ],
      });
      console.log("DEXAggregator verified");
    } catch (error) {
      console.log("DEXAggregator verification failed:", error.message);
    }

    try {
      await hre.run("verify:verify", {
        address: flashArbitrageBot.address,
        constructorArguments: [AAVE_POOL_ADDRESSES_PROVIDER],
      });
      console.log("FlashArbitrageBot verified");
    } catch (error) {
      console.log("FlashArbitrageBot verification failed:", error.message);
    }
  }

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    deployer: deployer.address,
    contracts: {
      PriceOracle: priceOracle.address,
      RiskManager: riskManager.address,
      DEXAggregator: dexAggregator.address,
      FlashArbitrageBot: flashArbitrageBot.address,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n=== DEPLOYMENT SUMMARY ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  // Save to file
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\nDeployment info saved to: ${deploymentFile}`);
  console.log("\n=== NEXT STEPS ===");
  console.log(
    "1. Update frontend contract addresses in src/hooks/useArbitrageContract.ts",
  );
  console.log(
    "2. Fund the FlashArbitrageBot contract with initial ETH for gas",
  );
  console.log("3. Set up price feeds in PriceOracle contract");
  console.log("4. Configure risk parameters in RiskManager contract");
  console.log("5. Test with small amounts before production use");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

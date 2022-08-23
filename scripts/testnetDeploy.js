const { ethers } = require("hardhat");

const wethAddress = '0xae13d989dac2f0debff460ac112a837c89baa7cd';
const pawswapFactory = '0xF1D715d460Be0e8fc4270eD99b1DCa7247FB9627';
const pawswapRouter = '0x6f6824ecc7b172BE62558264fadA042615f62889';
const pawthereum = '0xdf09234aB3247656F6672DCcc011F78bBabCB8Ea';
const pancakeSwapRouter = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const Pawswap = await ethers.getContractFactory("PawSwap");
  const pawswap = await Pawswap.deploy(pawswapFactory, pawswapRouter, wethAddress);
  const PawthTaxStructure = await ethers.getContractFactory("PawthTaxStructure");
  const pawthTaxStructure = await PawthTaxStructure.deploy(pawthereum, pancakeSwapRouter);
  await pawswap.setTokenTaxContract(pawthereum, pawthTaxStructure.address);

  console.log("Paswap address:", pawswap.address);
  console.log("tax struct addr", pawthTaxStructure.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
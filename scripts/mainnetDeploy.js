const { ethers } = require("hardhat");

const wethAddress = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
// const pawswapFactory = '0xF1D715d460Be0e8fc4270eD99b1DCa7247FB9627';
// const pawswapRouter = '0x6f6824ecc7b172BE62558264fadA042615f62889';
const pawthereumAddress = '0x409e215738E31d8aB252016369c2dd9c2008Fee0';
const pancakeSwapRouterAddress = '0x10ED43C718714eb63d5aA57B78B54704E256024E';

async function sleep (ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve()
    }, ms);
  })
}

async function verify (address, args) {
  try {
  // verify the token contract code
  await hre.run("verify:verify", {
      address: address,
      constructorArguments: args
  });
  } catch (e) {
  console.log("error verifying contract", e);
  }
  await sleep(1000);
}

const ZERO_ZERO_ZERO_ONE = '100000000000000';
const HALF_A_BEAN = '50000000000000000';
const ONE_MILLION_PAWTH = "1000000000000000";

let PawswapFactory;
let pawswapFactory;
let PawswapRouter;
let pawswapRouter;
let Pawswap;
let pawswap;
let Pawthereum;
let pawthereum;
let PawthTaxStructure;
let pawthTaxStructure;
let PancakeRouter

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  let baseNonce = await ethers.provider.getTransactionCount(deployer.address);
  let nonceOffset = 0;
  function getNonce() {
    return baseNonce + (nonceOffset++);
  }

  // contracts
  PawswapFactory = await ethers.getContractFactory("contracts/PawswapFactory.sol:PawswapFactory");
  PawswapRouter = await ethers.getContractFactory("contracts/PawswapRouter.sol:PawswapRouter");
  Pawswap = await ethers.getContractFactory("contracts/Pawswap.sol:PawSwap");
  pawthereum = await ethers.getContractAt("Pawthereum", pawthereumAddress);
  PawthTaxStructure = await ethers.getContractFactory("contracts/PawthTaxStructure.sol:PawthTaxStructure");
  pancakeSwapRouter = await ethers.getContractAt("PancakeRouter", pancakeSwapRouterAddress);

  // deploy
  pawswapFactory = await PawswapFactory.deploy({ nonce: getNonce() });
  console.log('deployed pawswapFactory...');
  await sleep(3000);

  pawswapRouter = await PawswapRouter.deploy(
    pawswapFactory.address,
    wethAddress,
    { nonce: getNonce() }
  );
  console.log('deployed pawswapRouter...');
  await sleep(3000);

  pawswap = await Pawswap.deploy(
    pawswapFactory.address,
    pawswapRouter.address,
    wethAddress,
    { nonce: getNonce() }
  );
  console.log('deployed pawswap...');
  await sleep(3000);

  await pawswapFactory.setPawswap(pawswap.address);
  await sleep(3000);
  console.log("pawswap set");

  pawthTaxStructure = await PawthTaxStructure.deploy(
    pawthereum.address,
    pancakeSwapRouterAddress,
    { nonce: getNonce() }
  );
  console.log('deployed pawth tax structure...');
  await sleep(3000);

  await pawswapFactory.setRouter(pawswapRouter.address, { nonce: getNonce() });
  console.log('set pawswap router in pawswap factory...');
  await sleep(3000);

  await pawswap.setTokenTaxContract(
    pawthereumAddress,
    pawthTaxStructure.address,
    { nonce: getNonce() }
  );
  await sleep(3000);
  console.log('listed pawthereum on pawswap...');


  console.log("Account balance after deploy:", (await deployer.getBalance()).toString());

  // verifications
  await verify(pawswap.address, [
    pawswapFactory.address,
    pawswapRouter.address,
    wethAddress,
  ]);
  await verify(pawthTaxStructure.address, [
    pawthereum.address,
    pawthTaxStructure.address,
  ]);

  console.log({
    pawswap: pawswap.address,
    pawthTaxStructure: pawthTaxStructure.address,
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
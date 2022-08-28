const { ethers } = require("hardhat");

let PawswapContract;
let pawswap;
let PawthereumContract;
let pawthereum;
let PawthTaxStructure;
let pawthTaxStructure;
let PawswapFactoryContract;
let pawswapFactory;
let PawswapRouterContract;
let pawswapRouter;
let PancakeFactoryContract;
let pancakeFactory;
let PancakeRouterContract;
let pancakeRouter;
let WethContract;
let weth;
let TaxStructureFactoryContract;
let taxStructureFactory;
let SafemoonContract;
let safemoon;
let PawthStakingContract;
let staking;
let owner;
let addr1;
let addr2;
let addrs;

async function main() {
  // We get the contract to deploy
  WethContract = await ethers.getContractFactory("WBNB");
  PawswapContract = await ethers.getContractFactory("PawSwap");
  PawthereumContract = await ethers.getContractFactory("contracts/Pawthereum.sol:Pawthereum");
  PawswapFactoryContract = await ethers.getContractFactory("PawswapFactory");
  PawswapRouterContract = await ethers.getContractFactory("PawswapRouter");
  PawthTaxStructure = await ethers.getContractFactory("PawthTaxStructure");
  TaxStructureFactoryContract = await ethers.getContractFactory("TaxStructureFactory");
  SafemoonContract = await ethers.getContractFactory("Safemoon");
  PawthStakingContract = await ethers.getContractFactory("PawthStaking"); 
  PancakeFactoryContract = await ethers.getContractFactory("PancakeFactory");
  PancakeRouterContract = await ethers.getContractFactory("PancakeRouter");

  // addresses
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();


  // deploy contracts
  weth = await WethContract.deploy();
  pawswapFactory = await PawswapFactoryContract.deploy();
  pawswapRouter = await PawswapRouterContract.deploy(pawswapFactory.address, weth.address);
  pawswap = await PawswapContract.deploy(pawswapFactory.address, pawswapRouter.address, weth.address);
  pancakeFactory = await PancakeFactoryContract.deploy(owner.address);
  pancakeRouter = await PancakeRouterContract.deploy(pancakeFactory.address, weth.address);
  pawthereum = await PawthereumContract.deploy(
    addr1.address,
    addr2.address,
    owner.address,
    pancakeRouter.address
  );
  pawthTaxStructure = await PawthTaxStructure.deploy(pawthereum.address, pancakeRouter.address);
  taxStructureFactory = await TaxStructureFactoryContract.deploy();
  safemoon = await SafemoonContract.deploy();
  staking = await PawthStakingContract.deploy();

  // set the factory router and pawswap
  await pawswapFactory.setRouter(pancakeRouter.address);
  await pawswapFactory.setPawswap(pawswap.address);  

  // set contracts to taxless
  await pawthereum.setTaxless(staking.address, true);
  await pawthereum.setTaxless(pawswap.address, true);
  await pawthereum.setTaxless(pawswapRouter.address, true);
  await pawthereum.setTaxless(pawswapFactory.address, true);

  // create a paswap LP
  const oneHundredMillionPawth = '100000000000000000';
  const tenEth = '10000000000000000000';
  await pawthereum.approve(pawswapRouter.address, oneHundredMillionPawth);
  await pawswapRouter.addLiquidityETH(
    pawthereum.address,
    oneHundredMillionPawth,
    '0',
    '0',
    owner.address,
    parseInt(new Date().getTime() / 1000 + 50000),
    { value: tenEth, from: owner.address }
  );

  // create a pancake LP
  await pawthereum.approve(pancakeRouter.address, oneHundredMillionPawth);
  await pancakeRouter.addLiquidityETH(
    pawthereum.address,
    oneHundredMillionPawth,
    '0',
    '0',
    owner.address,
    parseInt(new Date().getTime() / 1000 + 50000),
    { value: tenEth, from: owner.address }
  );

  // list pawthereum on pawswap
  await pawswap.setTokenTaxContract(pawthereum.address, pawthTaxStructure.address);

  const pancakeFactoryInit = await pancakeFactory.INIT_CODE_PAIR_HASH()
  console.log('factory init', pancakeFactoryInit)
  const factoryCode = await pawswapFactory.INIT_CODE_PAIR_HASH();
  console.log('factory init', factoryCode)
  const pair = await pawswapFactory.getPair(weth.address, pawthereum.address);
  console.log('pair', pair);

  await pawthTaxStructure.setTax1('Marketing Tax', addr2.address, '200', '200');
  await pawthTaxStructure.setTokenTax('Staking Tax', addr2.address, '200', '200');
  await pawthTaxStructure.setLiquidityTax(addr2.address, '200', '200');
  await pawthTaxStructure.setCustomTaxName('Extra Charity Tax');

  // transfer some pawth to other wallets
  await pawthereum.transfer(addrs[5].address, oneHundredMillionPawth);
  await pawthereum.connect(addrs[5]).transfer(addr1.address, oneHundredMillionPawth);
  await pawthereum.setTaxless(owner.address, false);
  await pawthereum.transfer(addrs[5].address, oneHundredMillionPawth);
  await pawthereum.setTaxless(owner.address, true);

  // setup a staking pool
  await staking.initialize(
    pawthereum.address,
    pawthereum.address,
    pawthereum.address,
    190258751902,
    200,
    0,
    pancakeRouter.address,
    [weth.address, pawthereum.address],
    [weth.address, pawthereum.address],
    true
  )
  await pawthereum.approve(staking.address, oneHundredMillionPawth)
  await staking.depositRewards(oneHundredMillionPawth)
  await staking.startReward(1);

  // setup other token test contracts
  await safemoon.initialize(pancakeRouter.address);
  await safemoon.excludeFromFee(pawswap.address);
  await safemoon.excludeFromFee(pancakeRouter.address);
  await safemoon.excludeFromFee(pancakeRouter.address);
  // create a safemoon LP
  const oneHundredMillionSfm = '100000000000000000';
  await safemoon.approve(pancakeRouter.address, oneHundredMillionSfm);
  await pancakeRouter.addLiquidityETH(
    safemoon.address,
    oneHundredMillionPawth,
    '0',
    '0',
    owner.address,
    parseInt(new Date().getTime() / 1000 + 50000),
    { value: tenEth, from: owner.address }
  );

  console.log({
    pawswap: pawswap.address,
    safemoon: safemoon.address,
    pawthereum: pawthereum.address,
    pancakeRouter: pancakeRouter.address,
    taxStructureFactory: taxStructureFactory.address
  })

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
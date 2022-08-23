// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("PawswapRouter contract", function () {
  // Mocha has four functions that let you hook into the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let PawswapContract;
  let pawswap;
  let PawthereumContract;
  let pawthereum;
  let PawthTaxStructure;
  let pawthTaxStructure;
  let PawswapFactoryContract;
  let factory;
  let PawswapRouterContract;
  let router;
  let WethContract;
  let weth;
  let PairContract;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    WethContract = await ethers.getContractFactory("WBNB");
    PawswapContract = await ethers.getContractFactory("PawSwap");
    PawthereumContract = await ethers.getContractFactory("contracts/Pawthereum.sol:Pawthereum");
    PawswapFactoryContract = await ethers.getContractFactory("PawswapFactory");
    PawswapRouterContract = await ethers.getContractFactory("PawswapRouter");
    PawthTaxStructure = await ethers.getContractFactory("PawthTaxStructure");
    PairContract = await ethers.getContractFactory("contracts/PawswapFactory.sol:PawswapPair");

    // addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contracts
    weth = await WethContract.deploy();
    factory = await PawswapFactoryContract.deploy();
    router = await PawswapRouterContract.deploy(factory.address, weth.address);
    pawswap = await PawswapContract.deploy(factory.address, router.address, weth.address);
    pawthereum = await PawthereumContract.deploy(
      addrs[5].address,
      addrs[6].address,
      addrs[7].address,
      router.address
    );
    pawthTaxStructure = await PawthTaxStructure.deploy(pawthereum.address, router.address);

    // set the factory router and pawswap
    await factory.setRouter(router.address);
    await factory.setPawswap(pawswap.address);

    // set contracts to taxless
    await pawthereum.setTaxless(pawswap.address, true);
    await pawthereum.setTaxless(router.address, true);
    await pawthereum.setTaxless(factory.address, true);

    // create an LP
    const oneHundredMillionPawth = '100000000000000000';
    const tenEth = '10000000000000000000';
    await pawthereum.approve(router.address, oneHundredMillionPawth);
    await router.addLiquidityETH(
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
  });

  describe("Manage liquidity", function () {
    it("Should be able to add liquidity", async function() {
      const oneHundredMillionPawth = '100000000000000000';
      const oneShannon = '1000000000'; // 0.0000000001 ETH
      // transfer enough pawth
      await pawthereum.transfer(addr1.address, oneHundredMillionPawth);
      // get the amount required to pair
      const amountIn = await router.getAmountsIn(oneShannon, [weth.address, pawthereum.address]);
      // approve the router
      await pawthereum.connect(addr1).approve(router.address, amountIn[0]);
      // capture the eth balance before the swap
      const ethBalanceBefore = await waffle.provider.getBalance(addr1.address);
      // capture the pawth balance before the swap
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      const addReq = await router.connect(addr1).addLiquidityETH(
        pawthereum.address,
        amountIn[0],
        '0',
        '0',
        addr1.address,
        parseInt(new Date().getTime() / 1000 + 50000),
        { value: oneShannon }
      );
      await addReq.wait();
      // eth balance after should be less than eth balance before
      const ethBalanceAfter = await waffle.provider.getBalance(addr1.address);
      expect(Number(ethBalanceAfter)).to.be.lessThan(Number(ethBalanceBefore));
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceAfter)).to.be.lessThan(Number(pawthBalanceBefore));
    })

    it("Should be able to remove liquidity", async function() {
      // add liquidity first
      const oneHundredMillionPawth = '100000000000000000';
      const oneShannon = '1000000000'; // 0.0000000001 ETH
      // transfer enough pawth
      await pawthereum.transfer(addr1.address, oneHundredMillionPawth);
      // get the amount required to pair
      const amountIn = await router.getAmountsIn(oneShannon, [weth.address, pawthereum.address]);
      // approve the router
      await pawthereum.connect(addr1).approve(router.address, amountIn[0]);
      const addReq = await router.connect(addr1).addLiquidityETH(
        pawthereum.address,
        amountIn[0],
        '0',
        '0',
        addr1.address,
        parseInt(new Date().getTime() / 1000 + 50000),
        { value: oneShannon }
      );
      await addReq.wait();
      // remove liquidity next
      // get the pair
      const pairAddress = await factory.getPair(weth.address, pawthereum.address);
      // const pair = await ethers.getContractAt(PairContract, pairAddress);
      const pair = new ethers.Contract(
        pairAddress, 
        [
          "function balanceOf(address owner) external view returns (uint)",
          "function approve(address spender, uint value) external returns (bool)"
        ], 
        owner
      );
      // get amount of LP tokens
      const lpBalanceBeforeRemoving = await pair.balanceOf(addr1.address);
      // approve the router
      await pair.connect(addr1).approve(router.address, lpBalanceBeforeRemoving);
      // remove the liquidity
      const removeReq = await router.connect(addr1).removeLiquidityETHSupportingFeeOnTransferTokens(
        pawthereum.address,
        lpBalanceBeforeRemoving,
        '0',
        '0',
        addr1.address,
        parseInt(new Date().getTime() / 1000 + 50000)
      );
      await removeReq.wait();
      // eth balance after should be less than eth balance before
      const lpBalanceAfterRemoving = await pair.balanceOf(addr1.address);
      expect(Number(lpBalanceBeforeRemoving)).to.be.greaterThan(Number(lpBalanceAfterRemoving));
    })
  })
});

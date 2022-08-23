// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { TokenAmount, Token, Percent } = require("@uniswap/sdk")

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Pawswap contract", function () {
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
  let SafemoonContract;
  let safemoon;
  let PancakeFactoryContract;
  let pancakeFactory;
  let PancakeRouterContract;
  let pancakeRouter;
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
    SafemoonContract = await ethers.getContractFactory("Safemoon");
    PancakeFactoryContract = await ethers.getContractFactory("PancakeFactory");
    PancakeRouterContract = await ethers.getContractFactory("PancakeRouter");
  
    // addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contracts
    weth = await WethContract.deploy();
    factory = await PawswapFactoryContract.deploy();
    router = await PawswapRouterContract.deploy(factory.address, weth.address);
    pawswap = await PawswapContract.deploy(factory.address, router.address, weth.address);
    pancakeFactory = await PancakeFactoryContract.deploy(owner.address);
    pancakeRouter = await PancakeRouterContract.deploy(pancakeFactory.address, weth.address);
    pawthereum = await PawthereumContract.deploy(
      addrs[5].address,
      addrs[6].address,
      addrs[7].address,
      pancakeRouter.address
    );
    pawthTaxStructure = await PawthTaxStructure.deploy(pawthereum.address, pancakeRouter.address);
    safemoon = await SafemoonContract.deploy()
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

    // setup other token test contracts
    await safemoon.initialize(router.address);
    await safemoon.excludeFromFee(pawswap.address);
    await safemoon.excludeFromFee(router.address);
    await safemoon.excludeFromFee(factory.address);
    // create a safemoon LP
    const oneHundredMillionSfm = '100000000000000000';
    await safemoon.approve(router.address, oneHundredMillionSfm);
    await router.addLiquidityETH(
      safemoon.address,
      oneHundredMillionSfm,
      '0',
      '0',
      owner.address,
      parseInt(new Date().getTime() / 1000 + 50000),
      { value: tenEth, from: owner.address }
    );
  });

  // You can nest describe calls to create subsections.
  describe("Deployment", function () {
    // `it` is another Mocha function. This is the one you use to define your
    // tests. It receives the test name, and a callback function.

    // If the callback function is async, Mocha will `await` it.
    it("Should set the right owner", async function () {
      expect(await pawswap.owner()).to.equal(owner.address);
    });

    it("Should be set to taxless by Pawthereum", async function () {
      expect(await pawthereum.isTaxlessAccount(pawswap.address)).to.equal(true);
    });

    it("Should exclude the pawswap router from dex treasury fees", async function () {
      expect(await pawswap.dexExcludedFromTreasury(router.address)).to.equal(true);
    });
  });

  describe("Swapping without taxes", function () {
    it("Should be able to buy with exact out trades", async function() {
      const oneThousandPawth = '1000000000000';
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      expect(pawthBalanceBefore).to.equal(0);
      const amountIn = await pawswap.connect(addr1).getBuyAmountIn(
        addr1.address,
        pawthereum.address,
        '0',
        oneThousandPawth
      );
      const slippage = new Percent(2, 100);
      const wethToken = new Token(1337, weth.address, 18);
      const buyAmount = new TokenAmount(wethToken, amountIn);
      const slippageAmount = new TokenAmount(wethToken, slippage.multiply(
        buyAmount.raw
      ).quotient)
      const buyAmountWithSlippage = buyAmount.add(slippageAmount);
      const buyReq = await pawswap.connect(addr1).buyOnPawSwap(
        pawthereum.address,
        '0',
        addr1.address,
        oneThousandPawth,
        false,
        { value: buyAmountWithSlippage.raw.toString() }
      );
      await buyReq.wait();
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceAfter)).to.be.greaterThan(Number(pawthBalanceBefore));
    });

    it("Should be able to buy with exact in trades", async function() {
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      expect(pawthBalanceBefore).to.equal(0);
      const quarterOfAnEth = '250000000000000000';
      const buyReq = await pawswap.connect(addr1).buyOnPawSwap(
        pawthereum.address,
        '0',
        addr1.address,
        '0',
        true,
        { value: quarterOfAnEth }
      );
      await buyReq.wait();
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceAfter)).to.be.greaterThan(Number(pawthBalanceBefore));
    });

    it("Should be able to sell with exact in trades", async function() {
      const fiveHundredPawth = '500000000000';
      await pawthereum.transfer(addr1.address, fiveHundredPawth);
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      await pawthereum.connect(addr1).approve(pawswap.address, fiveHundredPawth);
      const sellReq = await pawswap.connect(addr1).sellOnPawSwap(
        pawthereum.address,
        fiveHundredPawth,
        '0',
        addr1.address,
        '3148055657450',
        true
      );
      await sellReq.wait()
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceBefore)).to.be.greaterThan(Number(pawthBalanceAfter));
    });

    it("Should be able to sell with exact out trades", async function() {
      const fiveHundredPawth = '500000000000';
      await pawthereum.transfer(addr1.address, fiveHundredPawth);
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      await pawthereum.connect(addr1).approve(pawswap.address, fiveHundredPawth);
      await pawswap.connect(addr1).sellOnPawSwap(
        pawthereum.address,
        fiveHundredPawth,
        '0',
        addr1.address,
        '0',
        true
      );
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceBefore)).to.be.greaterThan(Number(pawthBalanceAfter));
    });
  });

  describe("Buying with taxes", function () {
    it("Should be able to buy exact in with eth and token taxes", async function() {
      // set the tax
      await pawthTaxStructure.setTax1('Marketing Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setTokenTax('Staking Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setLiquidityTax(addr2.address, '200', '200');
      // capture the pawth balance before the swap
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      // swap 0.25 ETH for pawth
      const quarterOfAnEth = '250000000000000000';
      const buyReq = await pawswap.connect(addr1).buyOnPawSwap(
        pawthereum.address,
        '0',
        addr1.address,
        '0',
        true,
        { value: quarterOfAnEth }
      );
      await buyReq.wait();
      // pawth balance after should be greater than pawth balance before
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      expect(Number(pawthBalanceAfter)).to.be.greaterThan(Number(pawthBalanceBefore));
    })

    it("Should be able to buy exact out with eth and token taxes", async function() {
      // set the tax
      await pawthTaxStructure.setTax1('Marketing Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setTax2('Charity Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setTokenTax('Staking Tax', addr2.address, '200', '200');
      // await pawthTaxStructure.setLiquidityTax(addr2.address, '200', '200');
      const oneThousandPawth = '1000000000000';
      const amountIn = await pawswap.getBuyAmountIn(
        addr1.address,
        pawthereum.address,
        '0',
        oneThousandPawth
      );
      console.log({ amountIn })
      const slippage = new Percent(2, 100);
      const wethToken = new Token(1337, weth.address, 18);
      const buyAmount = new TokenAmount(wethToken, amountIn);
      const slippageAmount = new TokenAmount(wethToken, slippage.multiply(
        buyAmount.raw
      ).quotient)
      const buyAmountWithSlippage = buyAmount.add(slippageAmount);
      const pawthBalanceBefore = await pawthereum.balanceOf(addr1.address);
      console.log({pawthBalanceBefore, amountIn, buyAmount: buyAmountWithSlippage.raw.toString()})
      const buyReq = await pawswap.connect(addr1).buyOnPawSwap(
        pawthereum.address,
        '0',
        addr1.address,
        oneThousandPawth,
        // buyAmountWithSlippage.raw.toString(),
        false,
        { value: buyAmountWithSlippage.raw.toString() }
      );
      const buyTx = await buyReq.wait();
      console.log({ buyTxGas: buyTx.gasUsed })
      // pawth balance after should be greater than pawth balance before
      const pawthBalanceAfter = await pawthereum.balanceOf(addr1.address);
      console.log({ pawthBalanceAfter })
      expect(pawthBalanceAfter).to.equal(oneThousandPawth);
    })
  })

  describe("Selling with taxes", function () {
    it("Should be able to sell exact in with eth and token taxes", async function() {
      const oneMillionPawth = '1000000000000000';
      // transfer enough pawth
      await pawthereum.transfer(addr1.address, oneMillionPawth);
      await pawthereum.connect(addr1).approve(pawswap.address, oneMillionPawth);
      // set the tax
      await pawthTaxStructure.setTax1('Marketing Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setTokenTax('Staking Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setLiquidityTax(addr2.address, '200', '200');
      // capture the eth balance before the swap
      const ethBalanceBefore = await waffle.provider.getBalance(addr1.address);
      const sellReq = await pawswap.connect(addr1).sellOnPawSwap(
        pawthereum.address,
        oneMillionPawth,
        '0',
        addr2.address,
        '0',
        true
      );
      const sellTx = await sellReq.wait();
      console.log({ sellTxGas: sellTx.gasUsed })
      // eth balance after should be greater than eth balance before
      const ethBalanceAfter = await waffle.provider.getBalance(addr1.address);
      expect(Number(ethBalanceAfter)).to.be.greaterThan(Number(ethBalanceBefore));
    })

    it("Should be able to sell exact out with eth and token taxes", async function() {
      // 0.25 eth
      const quarterOfAnEth = '25000000000000000';
      // set the tax
      await pawthTaxStructure.setTax1('Marketing Tax', addr2.address, '200', '200');
      await pawthTaxStructure.setTokenTax('Staking Tax', addrs[5].address, '200', '200');
      // get the amount out
      const amountIn = await pawswap.getSellAmountIn(
        addr1.address,
        pawthereum.address,
        '0',
        quarterOfAnEth
      );
      // transfer enough pawth
      await pawthereum.transfer(addr1.address, amountIn);
      await pawthereum.connect(addr1).approve(pawswap.address, amountIn);
      // capture the eth balance before the swap
      const ethBalanceBefore = await waffle.provider.getBalance(addr1.address);
      const sellReq = await pawswap.connect(addr1).sellOnPawSwap(
        pawthereum.address,
        amountIn,
        '0',
        addr2.address,
        quarterOfAnEth,
        false
      );
      await sellReq.wait();
      // eth balance after should be greater than eth balance before
      const ethBalanceAfter = await waffle.provider.getBalance(addr1.address);
      expect(Number(ethBalanceAfter)).to.be.greaterThan(Number(ethBalanceBefore));
    })
  })

  describe("Listing tokens", function () {
    it("Should be able to let pawswap owner list tokens", async function() {
      await pawswap.setTokenTaxContract(pawthereum.address, addr2.address);
      const taxContract = await pawswap.tokenTaxContracts(pawthereum.address);
      expect(taxContract).to.equal(addr2.address);
    })
    it("Should be able to let pawswap owner set other token listers", async function() {
      await pawswap.setListerAccount(addr1.address, true);
      const addr1IsLister = await pawswap.listers(addr1.address);
      expect(addr1IsLister).to.equal(true);
    })
    it("Should be able to let listers list tokens", async function() {
      await pawswap.setListerAccount(addr1.address, true);
      await pawswap.connect(addr1).setTokenTaxContract(pawthereum.address, addr2.address);
      const taxContract = await pawswap.tokenTaxContracts(pawthereum.address);
      expect(taxContract).to.equal(addr2.address);
    })
    it("Should be able to let token owners list their tokens", async function() {
      const newPawthereum = await PawthereumContract.connect(addr1).deploy(
        addrs[5].address,
        addrs[6].address,
        addrs[7].address,
        router.address
      );
      await pawswap.connect(addr1).setTokenTaxContract(newPawthereum.address, addr2.address);
      const taxContract = await pawswap.tokenTaxContracts(newPawthereum.address);
      expect(taxContract).to.equal(addr2.address);
    })
    it("Should revert if an excluded token is listed", async function() {
      const newPawthereum = await PawthereumContract.connect(addr1).deploy(
        addrs[5].address,
        addrs[6].address,
        addrs[7].address,
        router.address
      );
      await pawswap.excludeToken(newPawthereum.address, true);
      await expect(pawswap.connect(addr1).setTokenTaxContract(newPawthereum.address, addr2.address))
      .to.be.revertedWith("Token is not allowed to list");
    })
    it("Should revert if some rando tries to list a token", async function() {
      const newPawthereum = await PawthereumContract.deploy(
        addrs[5].address,
        addrs[6].address,
        addrs[7].address,
        router.address
      );
      await expect(pawswap.connect(addr1).setTokenTaxContract(newPawthereum.address, addr2.address))
      .to.be.revertedWith("Permission denied");
    })
  })
});

// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("Multicall contract", function () {
  // Mocha has four functions that let you hook into the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let WethContract;
  let weth;
  let PawthereumContract;
  let pawthereum;
  let MultiCallContract;
  let multicall;
  let PawthTaxStructure;
  let pawthTaxStructure;
  let TaxStructureFactory;
  let taxStructureFactory;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    WethContract = await ethers.getContractFactory("WBNB");
    PawthereumContract = await ethers.getContractFactory("contracts/Pawthereum.sol:Pawthereum");
    MultiCallContract = await ethers.getContractFactory("MultiCall");
    PawthTaxStructure = await ethers.getContractFactory("PawthTaxStructure");
    TaxStructureFactory = await ethers.getContractFactory("TaxStructureFactory");
    PancakeFactoryContract = await ethers.getContractFactory("PancakeFactory");
    PancakeRouterContract = await ethers.getContractFactory("PancakeRouter");
  
    // addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contracts
    weth = await WethContract.deploy();
    multicall = await MultiCallContract.deploy();
    pancakeFactory = await PancakeFactoryContract.deploy(owner.address);
    pancakeRouter = await PancakeRouterContract.deploy(pancakeFactory.address, weth.address);
    pawthereum = await PawthereumContract.deploy(
      addrs[5].address,
      addrs[6].address,
      addrs[7].address,
      pancakeRouter.address
    );
    pawthTaxStructure = await PawthTaxStructure.deploy(pawthereum.address, pancakeRouter.address);
    taxStructureFactory = await TaxStructureFactory.deploy();
  });

  describe("Pawth Tax Structure Multicall", function () {
    it("Should be able to get multiple data responses in one call from the pawth tax struct", async function() {
      // const callDataTax1Abi = new ethers.utils.Interface(["function tax1BuyAmount(address _address) external view returns (uint256)"])
      // const callDataTax1 = callDataTax1Abi.encodeFunctionData("tax1BuyAmount", [addr1.address])
      // const multicallResp = await multicall.multiCall([pawthTaxStructure.address], [callDataTax1])
      await pawthTaxStructure.setTax1("Charity Tax", addr1.address, 200, 200);
      const taxStructAbi = new ethers.utils.Interface([
          "function tax1(address _address)",
          "function tax2(address _address)",
      ]);
      const a = pawthTaxStructure.address;
      const tax1CallData = taxStructAbi.encodeFunctionData("tax1", [addr1.address]);
      const tax2CallData = taxStructAbi.encodeFunctionData("tax2", [addr1.address]);
      const multicallResp = await multicall.multiCall(
        [a, a], [tax1CallData, tax2CallData]
      );

      console.log({ 0: multicallResp[0] })
      const tax1BuyAmount = ethers.utils.defaultAbiCoder.decode(
        ['uint256', 'address'],
        ethers.utils.hexDataSlice(multicallResp[0], 0)
      )
      console.log(tax1BuyAmount[0].toString())
      // console.log({ tax1BuyAmount })
      const tax1Wallet = ethers.utils.defaultAbiCoder.decode(
        ['uint256', 'address'],
        ethers.utils.hexDataSlice(multicallResp[0], 66)
      )
      console.log({ tax1Wallet })
      const decodedData = taxStructAbi.decodeFunctionResult("tax1", multicallResp[0])
      console.log({ decodedData })
      // const tax1ReturnData = ethers.utils.hexlify(multicallResp[0])
      // const tax1Decoded = ethers.utils.defaultAbiCoder.decode(
      //   ['uint256', 'address'],
      //   ethers.utils.hexDataSlice(tax1ReturnData)
      // )
      // console.log({ tax1Decoded })
      // console.log(multicallResp)
      // console.log(ethers.utils.hexlify(multicallResp[0]))
    })
  })
});

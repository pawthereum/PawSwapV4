// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("TaxStructureFactory contract", function () {
  // Mocha has four functions that let you hook into the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  let TaxStructureFactory;
  let taxStructureFactory;
  let TaxStructure;
  let taxStructure;
  let PawswapFactoryContract;
  let factory;
  let PawswapRouterContract;
  let router;
  let WethContract;
  let weth;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    TaxStructureFactory = await ethers.getContractFactory("TaxStructureFactory");
    TaxStructure = await ethers.getContractFactory("TaxStructure");
    WethContract = await ethers.getContractFactory("WBNB");
    PawswapFactoryContract = await ethers.getContractFactory("PawswapFactory");
    PawswapRouterContract = await ethers.getContractFactory("PawswapRouter");

    // addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // deploy contracts
    weth = await WethContract.deploy();
    factory = await PawswapFactoryContract.deploy();
    taxStructureFactory = await TaxStructureFactory.deploy();
    router = await PawswapRouterContract.deploy(factory.address, weth.address);
  });

  describe("Create tax structures", function () {
    it("Should be able to deploy a tax structure from the factory", async function() {
      // deploy a tax contract
      const deployedTaxStructure = await taxStructureFactory.connect(addr1).deployTaxStructure(777, router.address)
      const tx = await deployedTaxStructure.wait()
      const event = tx.events.find(event => event.event === 'Deploy');
      const [addr] = event.args // address of the deployed contract emitted by event
      expect(addr.length).to.equal(42) // length of an ETH address
    })
    it("Should allow the deployer to execute owner functions", async function() {
      // TODO: write this test
    })
  })
});

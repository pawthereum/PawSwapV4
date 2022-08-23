require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;
const etherscanKey = process.env.ETHERSCAN_KEY;
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      mining: {
        auto: false,
        interval: 6000
      }
    },
    // bscTestnet: {
    //   url: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
    //   accounts: [privateKey]
    // },
    // bscMainnet: {
    //   url: 'https://bsc-dataseed.binance.org',
    //   accounts: [privateKey]
    // },
  },
  etherscan: {
    apiKey: etherscanKey
  },
  solidity: {
    compilers: [
      {
        version: "0.4.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.5.16",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.9",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: "0.8.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  }
};

import taxStructureFactoryJson from '../../artifacts/contracts/TaxStructureFactory.sol/TaxStructureFactory.json';
import taxStructureJson from '../../artifacts/contracts/TaxStructureFactory.sol/TaxStructure.json';
import pawswapJson from '../../artifacts/contracts/Pawswap.sol/PawSwap.json';
import { defaultChains } from 'wagmi';

const pawswapAbi = pawswapJson.abi;

// use testnet by default in prod until we are ready and localhost by default in dev
export const defaultChainId = process.env.NODE_ENV === 'production' ? 97 : 1337
export const validChains =  defaultChains?.concat([
  {
    id: 56,
    name: 'BNB Chain',
    network: 'bsc_mainnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: {
      default: 'https://bsc-dataseed.binance.org',
      default2: 'https://bsc-dataseed1.defibit.io/',
      default3: 'https://bsc-dataseed1.ninicoin.io/',
    },
    blockExplorers: {
      etherscan: {
        name: 'BNB Chain Explorer',
        url: 'https://bscscan.com',
      },
      default: {
        name: 'BNB Chain Explorer',
        url: 'https://bscscan.com',
      },
    },
    testnet: false,
  },
  {
    id: 97,
    name: 'BNB Testnet',
    network: 'bsc_testnet',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: {
      default: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    },
    blockExplorers: {
      etherscan: {
        name: 'BNB Testnet Explorer',
        url: 'https://testnet.bscscan.com/',
      },
      default: {
        name: 'BNB Testnet Explorer',
        url: 'https://testnet.bscscan.com/',
      },
    },
    testnet: true,
  },
  {
    id: 1337,
    name: 'Ganache',
    network: 'ganache',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: 'http://127.0.0.1:8545',
    },
    blockExplorers: {
      default: { name: 'Etherscan', url: 'https://wagmi.sh' },
    },
    testnet: true
  }
]);

export const NATIVE_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

export const PAWTH_CHARITY_WALLET = {
  1337: '0x9036464e4ecD2d40d21EE38a0398AEdD6805a09B',
}

export const PAWSWAP = {
  1337: {
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    abi: pawswapAbi,
  },
  97: {
    address: '0x81A3c0125ADD4A5466a27a71b31e0C13B1429091',
    abi: pawswapAbi,
  }
}

export const TAX_STRUCTURE_FACTORY = {
  1337: {
    address: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    abi: taxStructureFactoryJson.abi
  }
}

export const PANCAKESWAP_ROUTER = {
  1337: {
    address: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
  }
}

export const SAFEMOONSWAP_ROUTER = {
  1337: {
    address: '0x4FC8d32690cc91D4c39d9d3abcBD16989F875707',
  }
}

export const TAX_STRUCTURE_ABI = taxStructureJson.abi;

export const DEFAULT_SLIPPAGE = 1; // 1% default slippage

export const PAWSWAP_FEE = 3; // 0.03%
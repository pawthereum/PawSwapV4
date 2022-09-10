import { constants } from "ethers";
import { PANCAKESWAP_ROUTER, SAFEMOONSWAP_ROUTER, UNISWAP_ROUTER } from "../constants"

export const getRouterByAddress = (routerAddress, chain) => {
  const router = routerAddress?.toLowerCase();
  if (router === PANCAKESWAP_ROUTER[chain?.id]?.address?.toLowerCase()) {
    return PANCAKESWAP_ROUTER[chain?.id]
  } else if (router === SAFEMOONSWAP_ROUTER[chain?.id]?.address?.toLowerCase()) {
    return SAFEMOONSWAP_ROUTER[chain?.id]
  } else if (router === UNISWAP_ROUTER[chain?.id]?.address?.toLowerCase()) {
    return UNISWAP_ROUTER[chain?.id]
  } else {
    return { name: 'Unknown DEX', address: constants.AddressZero, fee: 0 }
  }
}

export default getRouterByAddress;
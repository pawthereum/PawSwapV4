import { tokenList } from "../constants/tokenList";
import { Token } from "@uniswap/sdk";

export const getPawth = (chain) => {
  const pawthListing = tokenList.tokens?.find(t => {
    return t.isPawthereum && t.chainId === chain?.id
  });
  
  const pawthToken = new Token(
    chain?.id,
    pawthListing?.address,
    pawthListing?.decimals,
    pawthListing?.symbol,
    pawthListing?.name
  );

  return {
    logoURI: pawthListing?.logoURI,
    token: pawthToken
  }
}

export const getNative = (chain) => {
  const nativeListing = tokenList?.tokens?.find(t => {
    return t.isNative && t.chainId === chain?.id
  });
  
  const nativeToken = new Token(
    chain?.id,
    nativeListing?.address,
    nativeListing?.decimals,
    nativeListing?.symbol,
    nativeListing?.name
  );

  return {
    logoURI: nativeListing?.logoURI,
    token: nativeToken
  }
}
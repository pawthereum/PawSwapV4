import { useEffect, useMemo, useState } from 'react';
import { BigNumber, constants, utils } from 'ethers';
import { tokenList } from '../constants/tokenList';
import { NATIVE_ADDRESS, PAWSWAP, TAX_STRUCTURE_ABI, DEFAULT_SLIPPAGE, PAWSWAP_FEE } from '../constants';
import { useAccount, useContractRead, useNetwork } from 'wagmi';
import { Token, Pair, TokenAmount, Route, Percent } from '@uniswap/sdk';
import { defaultChainId } from '../constants';
import { createExactInBuyTrade } from '../helpers/swap/createExactInBuyTrade';
import { createExactInSellTrade } from '../helpers/swap/createExactInSellTrade';
import { createExactOutBuyTrade } from '../helpers/swap/createExactOutBuyTrade';
import { createExactOutSellTrade } from '../helpers/swap/createExactOutSellTrade';
import { getPawth, getNative } from '../helpers/getTokens';

const useSwap = () => {
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [inputToken, setInputToken] = useState(null);
  const [outputToken, setOutputToken] = useState(null);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [userInputTokenBalance, setUserInputTokenBalance] = useState('');
  const [causeAmount, setCauseAmount] = useState('');
  const [swapError, setSwapError] = useState(null);
  const [isExactIn, setIsExactIn] = useState(false);
  const [trade, setTrade] = useState(null);
  const [slippage, setSlippage] = useState(DEFAULT_SLIPPAGE);

  const { address } = useAccount({
    onDisconnect() {
      if (address === cause) {
        setCause(null);
      }
    },
  });
  const [cause, setCause] = useState(address);

  const isNative = (token) => {
    return token?.address?.toLowerCase() === NATIVE_ADDRESS;
  }

  // this is the token that is not the native token in the trade
  const nonNativeTokenInSwap = useMemo(() => {
    if (!inputToken && !outputToken) {
      return null;
    }
    if (isNative(inputToken?.token)) {
      return outputToken;
    }
    if (isNative(outputToken?.token)) {
      return inputToken;
    }
    return null;
  }, [inputToken, outputToken, trade]);

  // native token in the trade
  const native = useMemo(() => {
    const n = tokenList.tokens.find(t => t.chainId === chain?.id && t.isNative);
    if (!n) return null;
    const token = new Token(chain?.id, n?.address, n?.decimals, n?.symbol, n?.name);
    return { token, logoURI: n?.logoURI }
  }, [chain]);

  const isBuy = useMemo(() => {
    if (!native || !inputToken) return false;
    return native?.token?.address === inputToken?.token?.address;
  }, [native?.token?.address, inputToken?.token?.address]);

  ////////////////////////////////////////
  // hooks for reading blockchain data //
  //////////////////////////////////////
  
  const { data: taxStructureAddress } = useContractRead({
    addressOrName: PAWSWAP[chain?.id]?.address,
    contractInterface: PAWSWAP[chain?.id]?.abi,
    functionName: 'tokenTaxContracts',
    args: [nonNativeTokenInSwap?.token?.address],
    enabled: nonNativeTokenInSwap !== null,
    watch: nonNativeTokenInSwap !== null,
    cacheTime: 30000,
  });

  const { data: buyTaxes } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getBuyTaxAmounts',
    args: [address || constants?.AddressZero],
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: sellTaxes } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getSellTaxAmounts',
    args: [address || constants?.AddressZero],
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: taxNames } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxNames',
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: taxWallets } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxWallets',
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: preSwapBuyTaxAmount } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getPreSwapBuyTaxAmount',
    args: [nonNativeTokenInSwap?.token?.address, 0]
  });

  const { data: postSwapBuyTaxAmount } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getPostSwapBuyTaxAmount',
    args: nonNativeTokenInSwap?.token?.address
  });

  const { data: preSwapSellTaxAmount } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getPreSwapSellTaxAmount',
    args: nonNativeTokenInSwap?.token?.address
  });

  const { data: postSwapSellTaxAmount } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getPostSwapSellTaxAmount',
    args: nonNativeTokenInSwap?.token?.address
  });

  const { data: reserves, internal: { dataUpdatedAt: reservesUpdated } } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getReserves',
    args: nonNativeTokenInSwap?.token?.address,
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 15000,
  });

  const sortTokens = (tokenList) => {
    return tokenList.sort((a, b) => 
      BigNumber.from(utils.getAddress(a.address)).lt( 
      BigNumber.from(utils.getAddress(b.address))) ? -1 : 1)
  }

  ////////////////////////////////////
  // useEffect for building trades //
  //////////////////////////////////

  useEffect(() => {
    if (!reserves) return setTrade(null);
    if (!inputAmount && !outputAmount) return setTrade(null);
    const sortedTokens = sortTokens([inputToken?.token, outputToken?.token]);
    const pair = new Pair(
      new TokenAmount(sortedTokens[0], reserves[0]),
      new TokenAmount(sortedTokens[1], reserves[1])
    );
    const route = new Route([pair], isExactIn ? outputToken?.token : inputToken?.token);
    const slippagePercentage = new Percent(slippage || 0, 100);

    let createdTrade;
    try {
      if (isBuy && isExactIn) {
        // account for optional cause tax
        preSwapBuyTaxAmount = Number(preSwapBuyTaxAmount) + Number(causeAmount * 100) + PAWSWAP_FEE;
        createdTrade = createExactInBuyTrade({
          route,
          inputAmount,
          inputToken,
          preSwapBuyTaxAmount,
          postSwapBuyTaxAmount,
          slippagePercentage,
        });
      }
      if (!isBuy && isExactIn) {
        postSwapSellTaxAmount = Number(postSwapSellTaxAmount) + Number(causeAmount * 100) + PAWSWAP_FEE;
        createdTrade = createExactInSellTrade({
          route,
          inputAmount,
          inputToken,
          preSwapSellTaxAmount,
          postSwapSellTaxAmount,
          slippagePercentage,
        });
      }
      if (isBuy && !isExactIn) {
        preSwapBuyTaxAmount = Number(preSwapBuyTaxAmount) + Number(causeAmount * 100) + PAWSWAP_FEE;
        createdTrade = createExactOutBuyTrade({
          route,
          outputAmount,
          inputToken,
          outputToken,
          preSwapBuyTaxAmount,
          postSwapBuyTaxAmount,
          slippagePercentage,
        })
      }
      if (!isBuy && !isExactIn) {
        postSwapSellTaxAmount = Number(postSwapSellTaxAmount) + Number(causeAmount * 100) + PAWSWAP_FEE;
        createdTrade = createExactOutSellTrade({
          route,
          outputAmount,
          inputToken,
          outputToken,
          preSwapSellTaxAmount,
          postSwapSellTaxAmount,
          slippagePercentage,
        });
      }
      const userBalanceIsInsufficient = BigNumber.from(
        userInputTokenBalance?.raw?.toString()).lt(
          BigNumber.from(inputAmount?.raw?.toString()
        )
      );
      if (userBalanceIsInsufficient) {
        setSwapError({ name: 'Insufficient Balance' });
      } else {
        setSwapError(null);
      }
      console.log({ createdTrade })
    } catch (e) {
      console.log({ e });
      setSwapError(e);
    }
    setTrade(createdTrade);
  }, [reserves, reservesUpdated, inputAmount, outputAmount, slippage, causeAmount]);


  const totalBuyTax = useMemo(() => {
    if (!buyTaxes) return BigNumber.from('0');
    const buyTaxTotal = buyTaxes?.reduce((p, c) => BigNumber.from(c).add(p), BigNumber.from('0'));
    if (!causeAmount) return buyTaxTotal;
    return Number(buyTaxTotal) + Number(causeAmount * 100);
  }, [buyTaxes, causeAmount]);

  const totalSellTax = useMemo(() => {
    if (!sellTaxes) return BigNumber.from('0');
    const sellTaxTotal = sellTaxes?.reduce((p, c) => BigNumber.from(c).add(p), BigNumber.from('0'));
    if (!causeAmount) return sellTaxTotal;
    return Number(sellTaxTotal) + Number(causeAmount * 100);
  }, [sellTaxes, causeAmount]);

  /////////////////////////////////
  // effects for updating state //
  ///////////////////////////////

  useEffect(() => {
    if (connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [connectedChain]);

  useEffect(() => {
    setInputToken(getNative(chain));
    setOutputToken(getPawth(chain));
  }, [chain]);

  ////////////////////////////////////////////////////////
  // contexts for updating state from other components //
  //////////////////////////////////////////////////////

  const updateInputToken = (selection) => {
    setInputAmount('');
    setOutputAmount('');
    setTrade(null);
    setInputToken(selection);
    if (!isNative(selection?.token)) {
      setOutputToken(native);
    }
    if (isNative(selection?.token) && isNative(outputToken?.token)) {
      setOutputToken(null);
    }
  }

  const updateOutputToken = (selection) => {
    setInputAmount('');
    setOutputAmount('');
    setTrade(null);
    setOutputToken(selection);
    if (!isNative(selection?.token)) {
      setInputToken(native);
    }
    if (isNative(selection?.token) && isNative(inputToken?.token)) {
      setInputToken(null);
    }
  }

  const updateUserInputTokenBalance = (amount) => {
    if (!amount || !inputToken) return;
    setUserInputTokenBalance(new TokenAmount(
      inputToken?.token,
      utils.parseUnits(amount || '0', inputToken?.token?.decimals || 18)
    ));
  }
  
  const updateInputAmount = (amount) => {
    setInputAmount(new TokenAmount(
      inputToken?.token,
      utils.parseUnits(amount || '0', inputToken?.token?.decimals || 18)
    ));
    setIsExactIn(true);
  }

  const updateOutputAmount = (amount) => {
    setOutputAmount(new TokenAmount(
      outputToken?.token,
      utils.parseUnits(amount || '0', outputToken?.token?.decimals || 18)
    ));
    setIsExactIn(false);
  }

  const updateCauseAmount = (amount) => {
    setCauseAmount(BigNumber.from(amount?.toString()?.trim() || '0'));
  }

  const updateCause = (cause) => {
    setCause(cause);
  }

  const updateSlippage = (slippage) => {
    setSlippage(slippage);
  }

  return {
    buyTaxes,
    sellTaxes,
    taxNames,
    taxWallets,
    nonNativeTokenInSwap,
    causeAmount,
    inputToken,
    outputToken,
    inputAmount,
    outputAmount,
    cause,
    isExactIn,
    slippage,
    swapError,
    trade,
    totalBuyTax,
    totalSellTax,
    isBuy,
    updateInputToken,
    updateOutputToken,
    updateInputAmount,
    updateUserInputTokenBalance,
    updateOutputAmount,
    updateCauseAmount,
    updateCause,
    updateSlippage,
  }
}

export default useSwap;
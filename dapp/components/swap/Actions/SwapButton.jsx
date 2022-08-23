import { useContext, useMemo, useState, useEffect } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import SwapContext from '../../../context/SwapContext';
import { defaultChainId, PAWSWAP } from '../../../constants';
import ConfirmSwap from './ConfirmSwap';
import TradeDetails from '../TradeDetails';

export const SwapButton = () => {
  const {
    slippage,
    isBuy,
    outputAmount,
    inputAmount,
    cause,
    causeAmount,
    inputToken,
    outputToken,
    isExactIn,
    trade,
  } = useContext(SwapContext);
  const { address } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  const contractConfig = useMemo(() => {
    return {
      addressOrName: PAWSWAP[chain?.id]?.address,
      contractInterface: PAWSWAP[chain?.id]?.abi,
    }
  }, [chain]);

  const prepareConfig = useMemo(() => {
    if (isBuy && isExactIn) {
      return {
        ...contractConfig,
        functionName: 'buyOnPawSwap',
        args: [
          outputToken?.token?.address,
          causeAmount || '0',
          cause?.address || address,
          trade?.calculatedAmountWithSlippage?.raw?.toString(),
          true
        ],
        overrides: {
          from: address,
          value: inputAmount?.raw?.toString()
        }
      }
    }
    if (isBuy && !isExactIn) {
      return {
        ...contractConfig,
        functionName: 'buyOnPawSwap',
        args: [
          trade?.swapResult?.outputAmount?.token?.address,
          causeAmount || '0',
          cause?.address || address,
          outputAmount?.raw?.toString(),
          false
        ],
        overrides: {
          from: address,
          value: trade?.calculatedAmountWithSlippage?.raw?.toString()
        }
      }
    }
    if (!isBuy && isExactIn) {
      return {
        ...contractConfig,
        functionName: 'sellOnPawSwap',
        args: [
          inputToken?.token?.address,
          inputAmount?.raw?.toString(),
          causeAmount || '0',
          cause?.address  || address,
          trade?.calculatedAmountWithSlippage?.raw?.toString(),
          true
        ],
      }
    }
    if (!isBuy && !isExactIn) {
      return {
        ...contractConfig,
        functionName: 'sellOnPawSwap',
        args: [
          inputToken?.token?.address,
          trade?.calculatedAmountWithSlippage?.raw?.toString(),
          causeAmount || '0',
          cause?.address  || address,
          outputAmount?.raw?.toString(),
          false
        ],
      }
    }
    return null;
  }, [isBuy, isExactIn, trade]);


  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  return (
    <div className="grid grid-flow-row gap-2 text-sm">
      { !trade ? <></> :
        <TradeDetails trade={trade} slippage={slippage} />
      }
      <ConfirmSwap 
        prepareConfig={prepareConfig} 
        trade={trade}
        chain={chain}
        cause={cause}
        params={{
          inputAmount,
          outputAmount,
          inputToken,
          outputToken,
          isExactIn,
          slippage,
          isBuy,
          cause,
          causeAmount
        }}
      />
    </div>
  )
}

export default SwapButton;
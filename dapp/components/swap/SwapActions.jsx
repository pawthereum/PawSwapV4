import { useContext, useEffect, useState } from 'react';
import { erc20ABI, useAccount, useContractRead, useNetwork } from 'wagmi';
import SwapContext from '../../context/SwapContext';
import ApproveButton from './Actions/ApproveButton';
import SwapButton from './Actions/SwapButton';
import { BigNumber } from 'ethers';
import { defaultChainId, PAWSWAP, NATIVE_ADDRESS } from '../../constants';

export const SwapActions = () => {
  const {
    inputAmount,
    inputToken,
  } = useContext(SwapContext);
  const [allowance, setAllowance] = useState(0);
  const { address, isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(true);

  const checkHasSufficientAllowance = async () => {
    if (!inputAmount) return setHasSufficientAllowance(true);
    setHasSufficientAllowance(
      BigNumber.from(allowance?.toString() || '0').gte(
        BigNumber.from(inputAmount?.raw?.toString() || '0')
      )
    );
  }

  const { 
    data: allowanceData, 
    isFetched: allowanceIsFetched, 
    internal: { 
      dataUpdatedAt: allowanceUpdated 
    }} = useContractRead({
    addressOrName: inputToken?.token?.address,
    contractInterface: erc20ABI,
    functionName: 'allowance',
    args: [address, PAWSWAP[chain?.id]?.address],
    // watch: true,
  });

  useEffect(() => {
    setAllowance(allowanceData);
  }, [allowanceIsFetched, allowanceUpdated]);

  useEffect(() => {
    if (!inputToken) return;
    if (inputToken?.token?.address?.toLowerCase() === NATIVE_ADDRESS) return setHasSufficientAllowance(true);
    if (!allowance) return setHasSufficientAllowance(false);
    checkHasSufficientAllowance();
  }, [allowance, inputAmount, inputToken]);

  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  return (
    <div className="grid grid-rows-flow w-full gap-2">
      { !hasSufficientAllowance 
        ? <ApproveButton />
        : <SwapButton />
      }
    </div>
  )
} 

export default SwapActions;
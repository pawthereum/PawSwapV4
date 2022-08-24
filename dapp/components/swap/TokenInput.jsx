import { useContext, useEffect, useMemo, useState } from 'react';
import { erc20ABI, useAccount, useBalance, useContractRead } from 'wagmi';
import { utils } from 'ethers';
// Constants
import { NATIVE_ADDRESS } from '../../constants';
// Components
import TokenSelector from './TokenSelector';
// Context
import SwapContext from '../../context/SwapContext';
// Helpers
import formatWithCommas from '../../helpers/formatWithCommas';

export const TokenInput = ({ side }) => {
  const { 
    isExactIn,
    inputToken,
    outputToken,
    inputAmount, 
    updateInputAmount,
    outputAmount,
    updateOutputAmount,
    updateUserInputTokenBalance,
    trade
  } = useContext(SwapContext); 
  const { isConnected, address } = useAccount();
  const [amount, setAmount] = useState('');

  const handleAmountChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setAmount(e.target.value);
    if (side === 'output') {
      updateOutputAmount(e.target.value);
    } else {
      console.log('updating input to...', e.target.value)
      updateInputAmount(e.target.value);
    }
  }

  const token = useMemo(() => {
    if (side === 'output') {
      return outputToken?.token;
    } else {
      return inputToken?.token;
    }
  }, [inputToken, outputToken, side]);

  const { data: userTokenBalance } = useContractRead({
    addressOrName: token?.address,
    contractInterface: erc20ABI,
    functionName: 'balanceOf',
    enabled: isConnected,
    watch: true,
    cacheTime: 30000,
    args: address
  });

  const { data: userNativeBalance } = useBalance({
    addressOrName: address,
    enabled: isConnected,
    watch: true,
    cacheTime: 30000,
  });

  const userBalance = useMemo(() => {
    let balance;
    if (token?.address?.toLowerCase() === NATIVE_ADDRESS) {
      balance = userNativeBalance?.value;
    } else {
      balance = userTokenBalance;
    }
    if (token && side != 'output') {
      updateUserInputTokenBalance(balance?.toString());
    }
    return balance;
  }, [token, userTokenBalance, userNativeBalance]);

  useEffect(() => {
    if (side === 'output' && isExactIn) {
      if (outputAmount === '') return setAmount('');
      setAmount(utils.formatUnits(
        outputAmount?.raw?.toString() || '0',
        outputToken?.token?.decimals || 18
      ));
    } 
    if (side === 'input' && !isExactIn) {
      if (inputAmount === '') return setAmount('');
      setAmount(utils.formatUnits(
        inputAmount?.raw?.toString() || '0',
        inputToken?.token?.decimals || 18
      ));
    }
  }, [inputAmount, outputAmount, inputToken, outputToken]);


  useEffect(() => {
    if (!trade) return;
    if (side === 'output' && isExactIn) {
      setAmount(utils.formatUnits(
        trade?.calculatedAmount?.raw?.toString() || '0',
        outputToken?.token?.decimals || 18
      ));
    }
    if (side === 'input' && !isExactIn) {
      setAmount(utils.formatUnits(
        trade?.calculatedAmount?.raw?.toString() || '0',
        inputToken?.token?.decimals || 18
      ));
    }
  }, [trade]);

  const sideLabel = useMemo(() => {
    if (!side) return '...';
    const label = side === 'output' ? 'To' : 'From'

    // no estimated label if both inputs are blank
    if (!inputAmount && !outputAmount) {
      return label;
    }
    
    // apply estimated label if side is estimated
    const isEstimatedOutput = isExactIn && side === 'output';
    const isEstimatedInput = !isExactIn && side != 'output';
    if (isEstimatedOutput || isEstimatedInput) {
      return label + ' (estimated)';
    }

    return label;
  }, [side, isExactIn, inputAmount, outputAmount]);

  return (
    <div className="grid grid-flow-row auto-rows-auto">
      <div className="flex justify-between mb-2">
        <span>{sideLabel}</span>
        <span>Balance: {
          formatWithCommas(
            utils.formatUnits(userBalance?.toString() || '0', token?.decimals)
          )
        }</span>
      </div>
      <div className="flex bg-base-200 rounded-lg items-center shadow-inner">
        <input 
          type="text" 
          onChange={handleAmountChanged}
          value={amount}
          placeholder="Type here" 
          className="input shadow-inner clip-right bg-base-200 hover:bg-base-300 focus:outline-0 rounded-r-none input-lg w-full" 
        />
        <TokenSelector side={side} />
      </div>
    </div>
  )
}

export default TokenInput;
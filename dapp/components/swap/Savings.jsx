import { useContext, useMemo, useEffect, useState } from 'react';
import { MoreHorizontal } from 'react-feather';
import SwapContext from '../../context/SwapContext';

export const Savings = () => {
  const { 
    typicalBuyTax, 
    typicalSellTax,
    totalSellTax,
    totalBuyTax,
    isBuy
  } = useContext(SwapContext);

  const [buySavings, setBuySavings] = useState(null);
  const [sellSavings, setSellSavings] = useState(null);

  useEffect(() => {
    console.log({typicalBuyTax, totalBuyTax})
    if (!typicalBuyTax || !totalBuyTax) return;
    console.log('setting buy...')
    setBuySavings(typicalBuyTax - Number(totalBuyTax?.toString()));
  }, [typicalBuyTax, totalBuyTax]);

  useEffect(() => {
    if (!typicalSellTax || !totalSellTax) return;
    setSellSavings(typicalSellTax - Number(totalSellTax?.toString()));
  },[typicalSellTax, totalSellTax]);

  const savings = useMemo(() => {
    console.log('updating...')
    return isBuy ? buySavings : sellSavings;
  },[isBuy, buySavings, sellSavings]);

  return (
    <div className="w-full flex justify-center">
      { !savings ? <MoreHorizontal className="h-5 w-5" /> :
        <div className="flex flex-col w-full border-opacity-50">
          <div className="divider">You are saving {buySavings}%!</div>
        </div>
      }
    </div>
  )
}

export default Savings;
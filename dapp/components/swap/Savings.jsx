import { useContext, useMemo } from 'react';
import { MoreHorizontal } from 'react-feather';
import SwapContext from '../../context/SwapContext';

export const Savings = () => {
  const { typicalBuyTax, totalBuyTax } = useContext(SwapContext);

  const buySavings = useMemo(() => {
    if (!typicalBuyTax || !totalBuyTax) return null;
    return typicalBuyTax - Number(totalBuyTax?.toString());
  }, [typicalBuyTax, totalBuyTax]);

  return (
    <div className="w-full">
      <div class="flex flex-col w-full border-opacity-50">
        <div class="divider">You are saving {buySavings}%!</div>
      </div>
      <MoreHorizontal className="h-5 w-5" />
    </div>
  )
}

export default Savings;
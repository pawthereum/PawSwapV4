import { useContext, useMemo, useEffect, useState } from 'react';
import { MoreHorizontal, HelpCircle } from 'react-feather';
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
          <div className="divider" style={{ gap: 0 }}>
            <div className="flex items-center mx-2">
              <span className="mr-1">You are saving {buySavings}%!</span>
              <label htmlFor="my-modal-4" className="btn btn-circle btn-ghost btn-xs shrink">
                <HelpCircle className="h-5 w-5" />
              </label>
            </div>
          </div>
          <input type="checkbox" id="my-modal-4" className="modal-toggle" />
          <label htmlFor="my-modal-4" className="modal cursor-pointer">
            <label className="modal-box relative" htmlFor="">
              <h3 className="text-lg font-bold">PawSwap saves you from fees!</h3>
              <p className="py-4">
                PawSwap provides incentives for projects to list with lower fees compared to other DEXs.
              </p>
              <p className="pb-2">
                That means that you are taxed less when swapping on PawSwap!
              </p>
              <p className="pb-2">
                Consider donating a portion of your savings to one of the thousands causes listed on PawSwap!
              </p>
            </label>
          </label>
        </div>
      }
    </div>
  )
}

export default Savings;
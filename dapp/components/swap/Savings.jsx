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
    if (!typicalBuyTax || !totalBuyTax) return;
    setBuySavings((typicalBuyTax * 100 - Number(totalBuyTax?.toString())) / 100);
  }, [typicalBuyTax, totalBuyTax]);

  useEffect(() => {
    if (!typicalSellTax || !totalSellTax) return;
    setSellSavings((typicalSellTax * 100 - Number(totalSellTax?.toString())) / 100);
  },[typicalSellTax, totalSellTax]);

  const savings = useMemo(() => {
    console.log('updating...')
    return isBuy ? buySavings : sellSavings;
  },[isBuy, buySavings, sellSavings]);

  console.log({ savings, buySavings, sellSavings })

  return (
    <div className="w-full flex justify-center">
      { !savings ? <MoreHorizontal className="h-5 w-5" /> :
        <div className="flex flex-col w-full border-opacity-50">
          <div className="divider" style={{ gap: 0 }}>
            <div className="flex items-center mx-2">
              <span className="mr-1">You are saving {savings > 0 ? savings.toLocaleString([], { maximumFractionDigits: 2 }) : '0'}%!</span>
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
              <div className="w-full flex justify-center">
                <MoreHorizontal className="h-5 w-5" />
              </div>
              <div className="collapse collapse-arrow">
                <input type="checkbox" className="peer" /> 
                <div className="collapse-title peer-checked:bg-secondary peer-checked:text-secondary-content rounded-t-lg">
                  I compared the amount out to another DEX and it looks like I get less tokens here?
                </div>
                <div className="collapse-content rounded-lg rounded-t-none bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"> 
                  <p className="text-sm">Other DEXs may display a higher amount of tokens to return however those exchanges do not factor a token&apos;s tax structure into account when displaying estimates.</p>
                  <p className="text-sm mt-2">Those DEXs rely on the user to set a high slippage in order to account for token taxes. PawSwap accounts for taxes and tells you the amount that is actually estimated to receive without the need to adjust for slippage.</p>
                </div>
              </div>
            </label>
          </label>
        </div>
      }
    </div>
  )
}

export default Savings;
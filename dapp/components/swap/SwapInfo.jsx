import { useContext, useEffect, useMemo, useState } from "react";
import SwapContext from "../../context/SwapContext";
import { utils } from 'ethers';
import { PAWSWAP_FEE, defaultChainId } from "../../constants";
import formatWithCommas from "../../helpers/formatWithCommas";
import getRouterByAddress from "../../helpers/getRouterAddress";
import { useNetwork } from 'wagmi';

export const SwapInfo = () => {
  const {
    inputToken,
    outputToken,
    buyTaxes,
    sellTaxes,
    totalBuyTax,
    totalSellTax,
    nonNativeTokenInSwap,
    taxNames,
    isBuy,
    trade,
    isExactIn,
    router,
  } = useContext(SwapContext);

  const [totalTax, setTotalTax] = useState(0);
  const [taxes, setTaxes] = useState([]);
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });

  const calculatedSymbol = useMemo(() => {
    return isExactIn ? outputToken?.token?.symbol : inputToken?.token?.symbol;
  }, [isBuy, isExactIn, trade])

  const calculatedLabel = useMemo(() => {
    return isExactIn ? 'Minimum amount out' : 'Maximum amount in';
  }, [isBuy, isExactIn, trade]);

  const calculatedAmount = useMemo(() => {
    if (isExactIn) {
      return formatWithCommas(
        utils.formatUnits(
          trade?.calculatedAmountWithSlippage?.raw?.toString() || '0',
          outputToken?.token?.decimals
        )
      );
    }
    if (!isExactIn) {
      return formatWithCommas(
        utils.formatUnits(
          trade?.calculatedAmountWithSlippage?.raw?.toString() || '0',
          inputToken?.token?.decimals
        )
      );
    }
  }, [isBuy, isExactIn, trade]);

  const impactClass = useMemo(() => {
    const impact = Number(trade?.swapResult?.priceImpact?.toSignificant(4));
    console.log({ impact })
    if (!impact) return '';
    if (impact >= 5) return 'text-error';
    if (impact < 5 && impact >= 3) return 'text-warning';
    if (impact < 3 && impact >= 1) return '';
    return 'text-success'; 
  }, [trade]);

  console.log({ trade, nonNativeTokenInSwap, taxNames, buyTaxes, sellTaxes, totalTax })

  useEffect(() => {
    setTaxes(isBuy ? buyTaxes : sellTaxes);
  }, [isBuy, buyTaxes, sellTaxes]);

  useEffect(() => {
    console.log({
      totalBuyTax: totalBuyTax?.toString()
    })
    setTotalTax(isBuy ? Number(totalBuyTax?.toString()) : Number(totalSellTax?.toString()));
  }, [isBuy, totalBuyTax, totalSellTax]);

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  if (!trade) return (<></>);

  return (
    <div className="card w-10/12 mx-auto max-w-lg bg-base-100 shadow mt-4 z-0">
      <div className="card-body text-sm pt-6">
        <div className="flex justify-between">
          <div>{calculatedLabel}</div>
          <div className="font-bold">{calculatedAmount} {calculatedSymbol}</div>
        </div>
        <div className="flex justify-between">
          <div>Price Impact</div>
          <div className={`${impactClass} font-bold`}>
            {trade?.swapResult?.priceImpact?.toSignificant(4)}%
          </div>
        </div>
        <div className="flex justify-between">
          <div>Total&nbsp;
            {nonNativeTokenInSwap?.token?.symbol || 'Loading...'}&nbsp;
            {isBuy ? 'Buy' : 'Sell'}&nbsp;Tax</div>
          <div className="font-bold">
            {totalTax ? totalTax / 100 : 'Loading...'}%
          </div>
        </div>
        {!taxes?.length && !taxNames?.length ? '' : taxes?.map((t, i) => (
          t?.toString() === '0' || taxNames[i] === '' ? '' :
          <div className="pl-4 text-xs">
            <div className="w-full">
              <div className="flex justify-between">
                <div>{taxNames[i]}</div>
                <div>
                  {t?.toString() / 100 || 'Loading...'}%
                </div>
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-between">
          <div>{getRouterByAddress(router, chain)?.name} Fee</div>
          <div className="font-bold">
          {getRouterByAddress(router, chain)?.fee}%
          </div>
        </div>
        <div className="flex justify-between">
          <div>PawSwap Fee</div>
          <div className="font-bold">
            {PAWSWAP_FEE / 100}%
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapInfo;
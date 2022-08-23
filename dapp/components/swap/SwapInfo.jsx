import { useContext, useMemo } from "react";
import SwapContext from "../../context/SwapContext";
import { utils } from 'ethers';
import formatWithCommas from "../../helpers/formatWithCommas";

export const SwapInfo = () => {
  const {
    inputToken,
    outputToken,
    buyTaxes,
    sellTaxes,
    isBuy,
    trade,
    isExactIn,
  } = useContext(SwapContext);

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

  console.log({ trade })

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
          <div>PancakeSwap Fee</div>
          <div className="font-bold">
            0.25%
          </div>
        </div>
        <div className="flex justify-between">
          <div>PawSwap Fee</div>
          <div className="font-bold">
            0.03%
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapInfo;
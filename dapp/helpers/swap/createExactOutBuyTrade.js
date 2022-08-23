import { TokenAmount, Trade, Percent, TradeType } from '@uniswap/sdk';
import { utils } from 'ethers';

const ONE_HUNDRED_PERCENT = new Percent(100, 100);

export const createExactOutBuyTrade = ({
  route,
  inputToken,
  outputToken,
  outputAmount,
  slippagePercentage,
  preSwapBuyTaxAmount,
  postSwapBuyTaxAmount
}) => {
  // calculate the amount needed to receive from a swap
  // while accounting for the amount taken out post swap
  const postSwapBuyTaxAmountPercentage = new Percent(postSwapBuyTaxAmount, 100**2);
  const oneHundredMinusPostSwapPercentage = ONE_HUNDRED_PERCENT.subtract(
    postSwapBuyTaxAmountPercentage
  );
  const amountReceivedFromSwap = new TokenAmount(
    outputToken?.token,
    utils.parseUnits(
      outputAmount.divide(oneHundredMinusPostSwapPercentage).toFixed(
        outputToken?.token?.decimals
      ),
      outputToken?.token?.decimals
    )
  );
  // calculate the amount needed to input into the swap
  // in order to receive the amount required
  const swapResult = new Trade(route, amountReceivedFromSwap, TradeType.EXACT_OUTPUT);

  // preswap deductions
  const preSwapBuyTaxAmountPercentage = new Percent(preSwapBuyTaxAmount, 100**2);
  const amountDeductedPreSwap = new TokenAmount(
    inputToken?.token,
    preSwapBuyTaxAmountPercentage.multiply(
      swapResult?.inputAmount.raw
    ).quotient
  );

  // amount returned to user
  const calculatedAmount = swapResult?.inputAmount?.add(amountDeductedPreSwap);
  // account for slippage
  const slippageAmount = new TokenAmount(
    swapResult?.inputAmount?.token,
    slippagePercentage.multiply(
      calculatedAmount?.raw
    ).quotient
  );
  const calculatedAmountWithSlippage = calculatedAmount.add(slippageAmount);
  return {
    swapResult,
    calculatedAmount,
    calculatedAmountWithSlippage
  }
}

export default createExactOutBuyTrade;
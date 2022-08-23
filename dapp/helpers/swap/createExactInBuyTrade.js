import { TokenAmount, Trade, Percent } from '@uniswap/sdk';

export const createExactInBuyTrade = ({
  route,
  inputToken,
  inputAmount,
  slippagePercentage,
  preSwapBuyTaxAmount,
  postSwapBuyTaxAmount
}) => {
  // preswap deductions
  const preSwapBuyTaxAmountPercentage = new Percent(preSwapBuyTaxAmount, 100**2);
  const amountDeductedPreSwap = new TokenAmount(
    inputToken?.token,
    preSwapBuyTaxAmountPercentage.multiply(
      inputAmount.raw
    ).quotient
  );
  const amountInSwap = inputAmount?.subtract(amountDeductedPreSwap);

  // execute swap
  const swapResult =  new Trade(route, amountInSwap);
  
  // post swap deductions
  const postSwapBuyTaxAmountPercentage = new Percent(postSwapBuyTaxAmount, 100**2);
  const amountDeductedPostSwap = new TokenAmount(
    swapResult?.outputAmount?.token,
    postSwapBuyTaxAmountPercentage.multiply(
      swapResult?.outputAmount?.raw
    ).quotient
  );

  // amount that will be returned to the user without slippage
  const calculatedAmount = swapResult?.outputAmount?.subtract(amountDeductedPostSwap);
  // account for slippage
  const slippageAmount = new TokenAmount(
    swapResult?.outputAmount?.token,
    slippagePercentage.multiply(
      calculatedAmount?.raw
    ).quotient
  );
  const calculatedAmountWithSlippage = calculatedAmount.subtract(slippageAmount);
  return {
    swapResult,
    calculatedAmount,
    calculatedAmountWithSlippage
  }
}

export default createExactInBuyTrade;
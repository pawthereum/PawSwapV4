import { TokenAmount, Trade, Percent, TradeType } from '@uniswap/sdk';
import { PAWSWAP_FEE } from '../../constants';

export const createExactInSellTrade = ({
  route,
  inputToken,
  inputAmount,
  slippagePercentage,
  preSwapSellTaxAmount,
  postSwapSellTaxAmount
}) => {
  // preswap deductions
  const preSwapSellTaxAmountPercentage = new Percent(preSwapSellTaxAmount, 100**2);
  const amountDeductedPreSwap = new TokenAmount(
    inputToken?.token,
    preSwapSellTaxAmountPercentage.multiply(
      inputAmount.raw
    ).quotient
  );
  const amountInSwap = inputAmount?.subtract(amountDeductedPreSwap);

  // execute swap
  const swapResult =  new Trade(route, amountInSwap, TradeType.EXACT_INPUT);
  
  // post swap deductions
  const postSwapSellTaxAmountPercentage = new Percent(postSwapSellTaxAmount, 100**2);
  const amountDeductedPostSwap = new TokenAmount(
    swapResult?.outputAmount?.token,
    postSwapSellTaxAmountPercentage.multiply(
      swapResult?.outputAmount?.raw
    ).quotient
  );

  // return to user
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

export default createExactInSellTrade;
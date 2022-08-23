import { TokenAmount, Trade, Percent, TradeType } from '@uniswap/sdk';
import { utils } from 'ethers';

const ONE_HUNDRED_PERCENT = new Percent(100, 100);

export const createExactOutSellTrade = ({
  route,
  inputToken,
  outputToken,
  outputAmount,
  slippagePercentage,
  preSwapSellTaxAmount,
  postSwapSellTaxAmount
}) => {
  // calculate the amount needed to receive from a swap
  // while accounting for the amount taken out post swap
  const postSwapSellTaxAmountPercentage = new Percent(postSwapSellTaxAmount, 100**2);
  const oneHundredMinusPostSwapPercentage = ONE_HUNDRED_PERCENT.subtract(
    postSwapSellTaxAmountPercentage
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

  // add on the preswap deductions to find the amount
  // that the user needs to provide
  const preSwapSellTaxAmountPercentage = new Percent(preSwapSellTaxAmount, 100**2);
  const amountDeductedPreSwap = new TokenAmount(
    inputToken?.token,
    preSwapSellTaxAmountPercentage.multiply(
      swapResult?.inputAmount.raw
    ).quotient
  );

  // the amount the user needs to provide. this amount will be reduced by the preswap
  // tax amount and then swapped for ETH. The ETH will be reduced by postswap taxes.
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

export default createExactOutSellTrade;
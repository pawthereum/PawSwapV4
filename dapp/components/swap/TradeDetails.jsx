export const TradeDetails = ({ trade, slippage }) => {
  return (
    <div className="dark:bg-neutral dark:text-neutral-content rounded-md mt-2 p-2 dark:shadow-inner">
      <div className="flex justify-between">
        <span>Price</span>
        <span>
          <span className="mr-1">
            { trade?.swapResult?.executionPrice?.toSignificant(2) || '0' }
          </span>
          { trade?.swapResult?.executionPrice?.quoteCurrency?.symbol }
          <span className="mx-1">per</span>
          { trade?.swapResult?.executionPrice?.baseCurrency?.symbol }
        </span>
      </div>
      <div className="flex justify-between">
        <span>Slippage Tolerance</span>
        <span>
          {slippage || 'Loading...'}%
        </span>
      </div>
    </div>
  )
}

export default TradeDetails;
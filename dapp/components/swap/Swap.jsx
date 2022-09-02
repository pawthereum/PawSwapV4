import { memo, useContext, useState, useEffect } from 'react';
import { ArrowDown } from 'react-feather';
import SwapContext from '../../context/SwapContext';
import { CauseSelector } from './CauseSelector';
import TokenInput from './TokenInput';
import ErrorMessage from './ErrorMessage';
import Settings from './Settings';
import SwapActions from './SwapActions';
import SwapInfo from './SwapInfo';
import Savings from './Savings';

export const Swap = memo(() => {
  const { swapError } = useContext(SwapContext);

  const [error, setError] = useState(null);

  useEffect(() => {
    setError(swapError);
  }, [swapError]);

  Swap.displayName = 'Swap';

  return (
    <div>
      <div className="card w-full max-w-xl bg-base-100 shadow-xl">
        <div className="card-body pt-6">

          {/* { HEADER } */}
          <div className="flex items-end justify-between mb-4">
            <div className="card-title grid grid-rows-2 gap-0">
              <div>PawSwap</div>
              <div className="text-sm text-primary opacity-75">a DEX by Pawthereum</div>
            </div>
            {/* { SETTINGS } */}
            <Settings />
          </div>

          {/* { INPUT } */}
          <TokenInput side='input' />

          <div className="flex items-center justify-center mt-2">
            <ArrowDown className="h-5 w-5" />
          </div>

          {/* { OUTPUT } */}
          <TokenInput side='output' />

          <div className="flex items-center justify-center my-2">
            <Savings />
          </div>

          {/* { CHARITY } */}
          <CauseSelector />
          
          <div className="card-actions justify-center mt-4">
            {/* { DISPLAY BUTTONS FOR SWAPPING } */}
            {/* { DISPLAY ERROR IF EXISTS } */}
            { !error ? <SwapActions /> : <ErrorMessage error={error} /> }
          </div>
        </div>
      </div>
      <SwapInfo />
    </div>
  )
})
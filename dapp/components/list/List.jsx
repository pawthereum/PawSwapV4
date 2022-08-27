import { memo, useContext, useState, useEffect } from 'react';
import TokenSelector from '../list/TokenSelector';
import ListContext from '../../context/ListContext';
import Steps from './Steps';
import LaunchContract from './LaunchContract';
import { Manage } from './Manage';
import ConfirmListing from './ConfirmListing';

export const List = memo(() => {
  const { step } = useContext(ListContext);
  List.displayName = 'List';

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
          </div>

          <div className="flex items-center justify-center mt-2">
            <Steps />
          </div>
          <div className="flex items-center justify-center mt-2">
            { step === 0 ? <TokenSelector /> : '' }
            { step === 1 ? <LaunchContract /> : '' }
            { step === 2 ? <Manage /> : '' }
            { step === 3 ? <ConfirmListing /> : '' }
          </div>

        </div>

      </div>
    </div>
  )
})
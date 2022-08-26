import { useContext, useEffect, useState } from 'react';
import { useNetwork } from 'wagmi';
import { defaultChainId } from '../../constants';
import TaxForm from './Tax/TaxForm';
import ListContext from '../../context/ListContext';

export const Manage = () => {
  const { listToken } = useContext(ListContext);
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId, nativeCurrency: { symbol: 'ETH' } });

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-xl">{chain?.nativeCurrency?.symbol} Taxes</div>
        <div className="flex">
          <div class="badge badge-success mx-1">
            4%
          </div>
          <div class="badge badge-error mx-1">
            5%
          </div>
        </div>
      </div>
      <div className="text-xs">These taxes go to the specified wallet in {chain?.nativeCurrency?.symbol}</div>
      <div className="divider my-0"></div>
      <TaxForm tax={null} />
      <div className="text-xl mt-8">{listToken?.token?.symbol} Taxes</div>
      <div className="text-xs">These taxes go to the specified wallet in {listToken?.token?.symbol}</div>
      <div className="divider my-0"></div>
    </div>
  )
}
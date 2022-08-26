import { useContext, useEffect, useMemo, useState } from 'react';
import { useNetwork } from 'wagmi';
import { defaultChainId } from '../../constants';
import TaxForm from './Tax/TaxForm';
import ListContext from '../../context/ListContext';

export const Manage = () => {
  const { taxNames, taxWallets, buyTaxes, sellTaxes, listToken } = useContext(ListContext);
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId, nativeCurrency: { symbol: 'ETH' } });

  console.log({ taxNames })

  const nativeTaxes = useMemo(() => {
    if (!taxNames || !taxWallets || !buyTaxes || !sellTaxes) return [];
    return taxNames.slice(0, 4).map((t, i) => {
      return {
        name: t,
        buy: buyTaxes[i],
        sell: sellTaxes[i],
        wallet: taxWallets[i]
      }
    })
  }, [taxNames, taxWallets, buyTaxes, sellTaxes]);

  console.log({ nativeTaxes })

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
          <div className="badge badge-success mx-1">
            4%
          </div>
          <div className="badge badge-error mx-1">
            5%
          </div>
        </div>
      </div>
      <div className="text-xs">These taxes go to the specified wallet in {chain?.nativeCurrency?.symbol}</div>
      <div className="divider my-0"></div>
      {nativeTaxes?.map((t, i) => (
        <TaxForm tax={t} key={i} index={i} />
      ))}
      <div className="text-xl mt-8">{listToken?.token?.symbol} Taxes</div>
      <div className="text-xs">These taxes go to the specified wallet in {listToken?.token?.symbol}</div>
      <div className="divider my-0"></div>
    </div>
  )
}
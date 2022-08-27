import { useContext, useEffect, useMemo, useState } from 'react';
import { useNetwork } from 'wagmi';
import { defaultChainId } from '../../constants';
import { BigNumber } from 'ethers';
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
        wallet: taxWallets[i],
        updateFunction: `setTax${i + 1}`
      }
    });
  }, [taxNames, taxWallets, buyTaxes, sellTaxes]);

  const tokenTaxes = useMemo(() => {
    return [taxNames[4], taxNames[5]].map((t, i) => {
      return {
        name: t,
        buy: buyTaxes[i + 4],
        sell: sellTaxes[i + 4],
        wallet: taxWallets[i + 4],
        updateFunction: `${i === 0 ? 'setTokenTax' : 'setBurnTax'}`
      }
    });
  }, [taxNames, taxWallets, buyTaxes, sellTaxes]);

  const liquidityTax = useMemo(() => {
    return [taxNames[6]].map((t, i) => {
      return {
        name: t,
        buy: buyTaxes[i + 6],
        sell: sellTaxes[i + 6],
        wallet: taxWallets[i + 6],
        updateFunction: `setLiquidityTax`
      }
    });
  }, [taxNames, taxWallets, buyTaxes, sellTaxes]);

  const totalBuyTax = useMemo(() => {
    if (!buyTaxes) return BigNumber.from('0');
    const bnTotal = buyTaxes?.reduce((p, c) => BigNumber.from(c).add(p), BigNumber.from('0'));
    return Number(bnTotal?.toString()) / 100;
  }, [buyTaxes]);

  const totalSellTax = useMemo(() => {
    if (!sellTaxes) return BigNumber.from('0');
    const bnTotal = sellTaxes?.reduce((p, c) => BigNumber.from(c).add(p), BigNumber.from('0'));
    return Number(bnTotal?.toString()) / 100;
  }, [sellTaxes]);

  console.log({ nativeTaxes, tokenTaxes })

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  return (
    <div>
      <div className="flex items-center justify-between mt-4">
        <div className="text-xl">Total Tax Amount</div>
        <div className="flex">
          <div className="badge badge-success mx-1">
            {totalBuyTax?.toString()}%
          </div>
          <div className="badge badge-error mx-1">
            {totalSellTax?.toString()}%
          </div>
        </div>
      </div>
      <div className="text-lg mt-8">{chain?.nativeCurrency?.symbol} Taxes</div>
      <div className="text-xs">These taxes go to the specified wallet in {chain?.nativeCurrency?.symbol}</div>
      <div className="divider my-0"></div>
      {nativeTaxes?.map((t, i) => (
        <TaxForm tax={t} key={i} index={i} />
      ))}
      <div className="text-lg mt-8">{listToken?.token?.symbol} Taxes</div>
      <div className="text-xs">These taxes go to the specified wallet in {listToken?.token?.symbol}</div>
      <div className="divider my-0"></div>
      {tokenTaxes?.map((t, i) => (
        <TaxForm tax={t} key={i} index={i} />
      ))}
      <div className="text-lg mt-8">Liquidity Tax</div>
      <div className="text-xs">This tax will be added to the {listToken?.token?.symbol}/{chain?.nativeCurrency?.symbol} LP and LP tokens will be sent to the wallet specified</div>
      <div className="divider my-0"></div>
      {liquidityTax?.map((t, i) => (
        <TaxForm tax={t} key={i} index={i} />
      ))}
    </div>
  )
}
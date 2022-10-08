import { useContext, useEffect, useMemo, useState } from 'react';
import { Token } from '@uniswap/sdk';
import Image from 'next/image';
import placeholder from '../../../public/img/placeholder.jpeg';
import { utils } from 'ethers';
import formatWithCommas from '../../../helpers/formatWithCommas';
import { tokenList } from '../../../constants/tokenList';
import { defaultChainId, NATIVE_ADDRESS } from '../../../constants';
import { erc20ABI, useAccount, useBalance, useContractReads, useNetwork } from 'wagmi';
// Context
import ListContext from '../../../context/ListContext';

export default function TokenSearchResult ({ token, isLoading, img, side }) {
  const { updateListToken } = useContext(ListContext); 
  const { address, isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [tokenBalances, setTokenBalances] = useState([]);
  const [results, setResults] = useState(tokenList.tokens.filter(t => {
    return t.isFeatured && t.chainId == chain?.id
  }));

  const { data: nativeBalance } = useBalance({
    addressOrName: address,
    enabled: isConnected,
    // watch: true,
  });

  const { data: tokenBalanceData, internal: tokenBalanceDataInternal } = useContractReads({
    contracts: results.map(r => {
      return {
        addressOrName: r?.address,
        contractInterface: erc20ABI,
        functionName: 'balanceOf',
        args: address,
      }
    }),
    enabled: isConnected,
  });

  useEffect(() => {
    const isNative = (token) => {
      return token?.address?.toLowerCase() === NATIVE_ADDRESS;
    }

    if (tokenBalanceData) {
      const nativeIndex = results.findIndex(r => isNative(r));
      if (nativeIndex) {
        tokenBalanceData[nativeIndex] = nativeBalance?.value;
      }
      setTokenBalances(tokenBalanceData);
    }
  }, [tokenBalanceDataInternal?.dataUpdatedAt]);

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  useEffect(() => {
    if (token) {
      token.logoURI = img;
      setResults([token]);
    } else {
      setResults(tokenList.tokens.filter(t => {
        return t.isFeatured && t.chainId == chain?.id
      }));
    }
  }, [token, img, chain]);

  const selectToken = (t) => {
    const token = new Token(chain?.id, t?.address, t?.decimals, t?.symbol, t?.name);
    updateListToken({ token, logoURI: t?.logoURI });
  }


  if (isLoading) return (
    <div className="flex justify-center w-full">
      <progress className="progress w-56"></progress>
    </div>
  );

  const TokenImage = ({ img }) => {
    if (!img) return (
      <Image
        src={placeholder}
        height={55}
        width={50}
      />
    )
    return (
      <Image
        src={img}
        height={50}
        width={50}
      />
    )
  }

  return (
    <div>
      {
        results.map((r, i) => (
          <label htmlFor={`${side}-token-selector`} key={r?.address}>
            <div 
              className="flex items-center mt-4 w-full py-2 px-4 cursor-pointer hover:shadow rounded-xl" 
              onClick={() => selectToken(r)}
              htmlFor={`${side}-token-selector`}
            >
              <div className="avatar mr-2">
                <div className="w-12 rounded-full">
                  <TokenImage img={r.logoURI} />
                </div>
              </div>
              <div className="grow" style={{ width: '100%' }}>
                <div className="text-lg">{r?.name}</div>
                <div className="text-sm">{r?.symbol}</div>
              </div>
              <div className="shrink text-right">
                <div className="text-lg">{
                  formatWithCommas(
                    utils.formatUnits(
                      !tokenBalances ? '0' : tokenBalances[i]?.toString() || '0', r?.decimals
                    )
                  )
                }</div>
              </div>
            </div>
          </label>
        ))
      }
    </div>
  )
}
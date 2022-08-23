import Image from 'next/image';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ChevronDown, X } from 'react-feather';
import { utils } from 'ethers';
import { useToken } from 'wagmi';
import TokenSearchResult from './TokenSelector/TokenSearchResult';
// Context
import SwapContext from '../../context/SwapContext';

const COINGECKO_API_ENDPOINT = `https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/`

export const TokenSelector = ({ side }) => {
  const { inputToken, outputToken } = useContext(SwapContext); 
  const [tokenQuery, setTokenQuery] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenImg, setTokenImg] = useState(null);

  const { data: erc20Data, isLoading: erc20DataLoading } = useToken({ address: tokenAddress });

  const selectedToken = useMemo(() => {
    if (side === 'output') {
      return outputToken;
    } else {
      return inputToken;
    }
  }, [inputToken, outputToken, side]);

  useEffect(() => {
    if (utils.isAddress(tokenQuery)) {
      setTokenAddress(tokenQuery);
    }
  }, [tokenQuery]);

  const clearResults = () => {
    setTokenAddress('');
    setTokenImg(null);
  }

  const handleTokenQueryChange = (e) => {
    clearResults();
    setTokenQuery(e.target.value);
  }

  const getTokenImg = async (address) => {
    const cgData = await fetch(COINGECKO_API_ENDPOINT + address);
    const cgJson = await cgData.json();
    setTokenImg(cgJson?.image?.large);
  }

  useEffect(() => {
    if (!tokenAddress) return;
    getTokenImg(tokenAddress);
  }, [tokenAddress]);

  const SelectedTokenImg = (selectedToken) => {
    if (!selectedToken?.token) return (<></>);
    return (
      <Image 
        height={28}
        width={28}
        src={selectedToken?.token?.logoURI}
      />
    );
  }

  return (
    <div className="min-w-max">
      <label htmlFor={`${side}-token-selector`} className="btn modal-button sm:shadow-inner clip-left min-h-full sm:btn-lg btn-ghost bg-base-200 hover:bg-base-300 rounded-l-none">
        <div className="avatar">
          <div className="rounded-full">
            <SelectedTokenImg token={selectedToken}/>
          </div>
        </div>
        <span className="ml-1">{selectedToken?.token?.symbol || 'Select Token'}</span>
        <ChevronDown className="h-5 w-5 ml-1" />
      </label>
      <input type="checkbox" id={`${side}-token-selector`} className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">Select Token</h3>
            <label htmlFor={`${side}-token-selector`} className="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"><X/></label>
          </div>
          <input 
            type="text" 
            placeholder="Search for Token"
            className="shadow-inner input bg-base-200 hover:bg-base-300 focus:outline-0 input-lg w-full" 
            value={tokenQuery}
            onChange={handleTokenQueryChange}
          />
          <TokenSearchResult 
            token={erc20Data} 
            isLoading={erc20DataLoading} 
            img={tokenImg}
            side={side}
          />
        </div>
      </div>
    </div>
  )
}

export default TokenSelector;
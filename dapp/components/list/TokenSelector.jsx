import Image from 'next/image';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, X } from 'react-feather';
import { utils } from 'ethers';
import { useToken } from 'wagmi';
import TokenSearchResult from './TokenSelector/TokenSearchResult';
// Context
import ListContext from '../../context/ListContext';

const COINGECKO_API_ENDPOINT = `https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/`

export const TokenSelector = ({ side }) => {
  const { listToken, nextStep } = useContext(ListContext); 
  const [tokenQuery, setTokenQuery] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [tokenImg, setTokenImg] = useState(null);

  const { data: erc20Data, isLoading: erc20DataLoading } = useToken({ address: tokenAddress });

  const selectedToken = useMemo(() => {
    return listToken;
  }, [listToken]);

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
    <div className="">
      <span className="label-text text-right">
        You must be the token owner to list
      </span>
      <div className="min-w-max">
        <label 
          htmlFor={`${side}-token-selector`} 
          className={`btn btn-wide modal-button shadow-inner min-h-full btn-lg btn-ghost bg-base-200 hover:bg-base-300`}
          >
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
        { !listToken ? <></> :
          <div className="w-full flex justify-center mt-2">
            <a className="btn btn-primary btn-lg btn-wide" onClick={() => nextStep()}>
              Next <ChevronRight className="h-5 w-5" />
            </a>
          </div>
        }
      </div>
    </div>
  )
}

export default TokenSelector;
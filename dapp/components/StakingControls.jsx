import { useState, useEffect } from 'react';
import Claim from './staking/Claim';
import Deposit from './staking/Deposit';
import Withdraw from './staking/Withdrawl';
import UserInfo from './staking/UserInfo';
import { tokenList } from '../constants/tokenList';
import { useContractRead, useAccount, useNetwork, useBalance, erc20ABI } from 'wagmi';
import { STAKING, defaultChainId } from '../constants';

const Staking = () => {
  const [activeTab, setActiveTab] = useState('deposit');
  const tabs = [
    { name: 'Deposit', value: 'deposit' },
    { name: 'Claim', value: 'claim' },
    { name: 'Withdraw', value: 'withdraw' },
  ];

  const { address, isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId, nativeCurrency: { symbol: 'BNB' } });
  const [tokenBalance, setTokenBalance] = useState(0);
  const [nativeBalance, setNativeBalance] = useState(0);
  const [stakedBalance, setStakedBalance] = useState(0);

  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId, nativeCurrency: { symbol: 'BNB' } });
    }
  }, [isConnected, connectedChain]);

  const { data: tokenBalanceData, isFetched: tokenBalanceFetched, refetch: refetchTokenBalance } = useContractRead({
    addressOrName: tokenList.tokens.find(t => t.isPawthereum && t.chainId === chain?.id)?.address,
    contractInterface: erc20ABI,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (tokenBalanceFetched) {
      setTokenBalance(tokenBalanceData);
    }
  }, [tokenBalanceData, tokenBalanceFetched, chain]);

  const { data: nativeBalanceData, isFetched: nativeBalanceFetched, refetch: refetchNativeBalance } = useBalance({
    addressOrName: address
  });

  useEffect(() => {
    if (nativeBalanceFetched) {
      setNativeBalance(nativeBalanceData?.value);
    }
  }, [nativeBalanceData, nativeBalanceFetched, chain]);

  const { data: stakedBalanceData, isFetched: stakedBalanceFetched, refetch: refetchStakedBalance } = useContractRead({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'balanceOf',
    args: [address],
  });

  useEffect(() => {
    if (stakedBalanceFetched) {
      setStakedBalance(stakedBalanceData);
    }
  }, [stakedBalanceData, stakedBalanceFetched, chain]);

  const refetchBalances = () => {
    refetchTokenBalance();
    refetchNativeBalance();
    refetchStakedBalance();
  }

  return (
    <div className="grid grid-flow-row gap-2">
      <UserInfo
        tokenBalance={tokenBalance}
        nativeBalance={nativeBalance}
        stakedBalance={stakedBalance}
        chain={chain} 
      />
      <div className="flex mx-auto">
        <div className="tabs tabs-boxed py-1 px-2 mb-2">
          {tabs.map((tab, index) => (
            <a 
              className={`btn-sm m-1 border-0 btn btn-ghost tab ${activeTab === tab.value ? 'tab-active' : ''}`} 
              onClick={() => setActiveTab(tab.value)}
              key={index}
            >
              <span className="uppercase font-bold">{tab.name}</span>
            </a> 
          ))}
        </div>
      </div>
      { activeTab === 'deposit' && <Deposit tokenBalance={tokenBalance} chain={chain} callback={refetchBalances} /> }
      { activeTab === 'claim' && <Claim /> }
      { activeTab === 'withdraw' && <Withdraw stakedBalance={stakedBalance} chain={chain} callback={refetchBalances} /> }
    </div>
  )
}

export default Staking;
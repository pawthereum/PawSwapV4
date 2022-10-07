import { validChains } from '../../constants';
import { defaultChainId } from '../../constants';
import { useState, useEffect } from 'react';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';

export const Chains = () => {
  const { isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const { switchNetwork } = useSwitchNetwork()

  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  const chainLogo = {
    1: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    3: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    4: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    5: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    42: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    1337: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880',
    56: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
    97: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png?1644979850',
  }

  return (
    <div className="dropdown dropdown-end">
      <div>
        <label tabIndex={0} className="btn btn-ghost">
          <img src={chainLogo[chain?.id]} className="h-8 w-8" />
        </label>
        <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral-content text-neutral rounded-box w-52">
          { !validChains ? <></> : validChains
            ?.map(c => (
              <li key={c.id}>
                <a
                  className="hover:bg-neutral-focus hover:text-neutral-content"
                  onClick={async () => {
                    switchNetwork?.(c?.id);
                  }}
                >
                  <img src={chainLogo[c?.id]} className="h-8 w-8" />
                  {c?.name}
                </a>
              </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Chains;
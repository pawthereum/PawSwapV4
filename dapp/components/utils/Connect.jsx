import React from 'react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { Activity, ChevronDown } from 'react-feather';
import { useAccount, useConnect, useDisconnect, useEnsName, useNetwork, useSwitchNetwork } from 'wagmi';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import walletIcon from '../../public/img/walletIcon.svg';
import Wallet from './icons/wallet';
// constants
import { validChains } from '../../constants';
// helpers
import shortenAddress from '../../helpers/shortenAddress'
// images
import metamaskIcon from '../../public/img/metamask.png';
import walletConnectIcon from '../../public/img/walletconnect.png';
import injectedIcon from '../../public/img/injected.png';
import coinbaseIcon from '../../public/img/coinbase.png';

export default function Connect() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { chain: connectedChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork()
  const { activeConnector, connect, connectors } = useConnect();
  const [hasAccount, setHasAccount] = useState(false);
  
  const [showMenu, setShowMenu] = useState(false);
  const showMenuHandler = () => setShowMenu((showMenu) => !showMenu);

  const { disconnect } = useDisconnect();

  const connectedToWrongNetwork = useMemo(() => {
    if (!connectedChain?.id || !isConnected) return false;
    const validChainIds = validChains?.map(c => c?.id);
    return !validChainIds?.includes(connectedChain?.id);
  }, [connectedChain, isConnected]);

  const getConnectorImg = (connectorName) => {
    switch (connectorName) {
      case 'MetaMask':
        return metamaskIcon;
      case 'WalletConnect':
        return walletConnectIcon;
      case 'Coinbase Wallet':
        return coinbaseIcon;
      default:
        return injectedIcon;
    }
  }

  useEffect(() => {
    setHasAccount(isConnected && !!address);
  }, [address, isConnected]);

  if (hasAccount) return (
    <div className="top-16 text-right">
      <div className="dropdown dropdown-end">
        {
          connectedToWrongNetwork 
          ? 
            <div>
              <label tabIndex={0} className="btn btn-warning m-1">
                <Activity
                  className="mr-2 h-5 w-5"
                  aria-hidden="true"
                />
                <span className="mr-2">Wrong Network</span>
                <ChevronDown
                  className="ml-2 h-5 w-5"
                  aria-hidden="true"
                />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral-content text-neutral rounded-box w-52">
                { !validChains ? <></> : validChains
                  ?.map(chain => (
                    <li key={chain.id}>
                      <a
                        className="hover:bg-neutral-focus hover:text-neutral-content"
                        onClick={async () => {
                          switchNetwork?.(chain?.id);
                          setShowMenu(false);
                        }}
                      >
                        {chain?.name}
                      </a>
                    </li>
                ))}
              </ul>
            </div>
          :
            <div>
              <label tabIndex={0} className="btn m-1">
                <span className="mr-2 sm:flex hidden">{ensName ?? shortenAddress(address)}</span>
                  <Jazzicon diameter={20} seed={jsNumberForAddress(address || '0x0')} />
                  <ChevronDown
                    className="ml-2 -mr-1 h-5 w-5"
                    aria-hidden="true"
                  />
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral-content text-neutral rounded-box">
                <li>
                  <a onClick={() => { disconnect(); setShowMenu(false); }} className="hover:bg-neutral-focus hover:text-neutral-content">
                    <div className="grid grid-flow-row w-full">
                      <div className="mx-auto">Disconnect</div>
                      <p className="sm:hidden mx-auto">
                        {ensName ?? shortenAddress(address)}
                      </p>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
        }
      </div>
    </div>
  )

  return (
    <div className="top-16 text-right">
      <div className="dropdown dropdown-end">
        <label tabIndex={0} className="btn m-1 flex items-center" onClick={showMenuHandler}>
          <div className="sm:block hidden">Connect</div>
          <div className="sm:hidden flex items-center">
            <Wallet className="fill-white h-6 w-6 mt-1" />
          </div>
          <ChevronDown
            className="ml-2 -mr-1 h-5 w-5"
            aria-hidden="true"
          />
        </label>
        {showMenu && <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-neutral-content text-neutral rounded-box w-56">
          { !connectors ? <></> : connectors
            .filter(connector => connector.ready && connector.id !== activeConnector?.id)
            ?.map(connector => (
              <li key={connector.id}>
                <div 
                  className="hover:bg-neutral-focus hover:text-neutral-content flex items-center"
                  onClick={async () => {
                    await connect({ connector });
                    setShowMenu(false);
                  }}
                >
                  <Image src={getConnectorImg(connector.name)} height={20} width={20} />
                  <a>
                    {connector.name}
                  </a>
                </div>
              </li>
            ))}
        </ul>}
      </div>
    </div>
  )
}
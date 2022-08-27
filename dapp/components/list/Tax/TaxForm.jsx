import { useContext, useEffect, useMemo, useState } from 'react';
import { Percent } from 'react-feather';
import ListContext from '../../../context/ListContext';
import NotificationContext from '../../../context/NotificationContext';
import { useContractWrite, usePrepareContractWrite, useNetwork } from 'wagmi';
import { TAX_STRUCTURE_ABI, defaultChainId } from '../../../constants';
import formatError from '../../../helpers/formatError';

export const TaxForm = ({ tax, index }) => {
  const { popNotification } = useContext(NotificationContext);
  const { listedTaxStructureAddress, taxStructureContractAddress } = useContext(ListContext);
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [name, setName] = useState('');
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [wallet, setWallet] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const nameIsChanged = (val1, val2) => {
    if (val1 === 'Tax ' + (index + 1)) return false;
    return String(val1?.toLowerCase().replace(/\s+/g, "")) !== String(val2?.toLowerCase().replace(/\s+/g, ""));
  }

  const taxIsChanged = (displayTax, contractTax) => {
    if (displayTax === '') {
      displayTax = 0;
    }
    if (contractTax === '') {
      contractTax = 0;
    }
    const val1 = Number(displayTax) * 100;
    const val2 = Number(contractTax?.toString() || 0);
    return val1 !== val2;
  }

  const handleNameChanged = (e) => {
    setName(e.target.value);
  }

  const handleWalletChanged = (e) => {
    setWallet(e.target.value);
  }

  const handleBuyChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setBuy(e.target.value);
  }

  const handleSellChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setSell(e.target.value);
  }

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  useEffect(() => {
    setName(tax?.name);
    setBuy(Number(tax?.buy?.toString() || 0) / 100);
    setSell(Number(tax?.sell?.toString() || 0) / 100);
    setWallet(tax?.wallet);
  }, [tax]);

  const displayBuy = useMemo(() => {
    return buy ? buy : '0';
  }, [buy]);

  const displaySell = useMemo(() => {
    return sell ? sell : '0';
  }, [sell]);

  const displayName = useMemo(() => {
    if (name === '') {
      if (tax?.name === '') {
        return 'Tax ' + (index + 1);
      }
      return tax?.name;
    }
    return name;
  }, [tax?.name, name]);

  useEffect(() => {
    if (nameIsChanged(displayName, tax?.name)) return setHasUnsavedChanges(true);
    if (nameIsChanged(wallet, tax?.wallet)) return setHasUnsavedChanges(true);
    if (taxIsChanged(displayBuy, tax?.buy)) return setHasUnsavedChanges(true);
    if (taxIsChanged(displaySell, tax?.sell)) return setHasUnsavedChanges(true);
    return setHasUnsavedChanges(false);
  }, [displayName, displayBuy, displaySell, wallet, tax?.name]);

  const updateArgs = useMemo(() => {
    const args = [
      name,
      wallet,
      Number(buy) * 100,
      Number(sell) * 100
    ];
    if (tax?.updateFunction === 'setBurnTax' || tax?.updateFunction === 'setLiquidityTax') {
      return args.slice(1,args.length);
    }
    return args;
  }, [tax, name, wallet, buy, sell]);

  console.log({ updateArgs })

  const { config, error } = usePrepareContractWrite({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: tax?.updateFunction,
    args: updateArgs
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    onError (e) {
      popNotification({
        type: 'error',
        title: 'Update Error',
        description: `${formatError(e?.toString())}`
      });
    },
    async onSuccess (data) {
      setUpdateInProgress(true);
      popNotification({
        type: 'success',
        title: 'Update Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      setUpdateInProgress(false);
      popNotification({
        type: 'success',
        title: 'Update Confirmed!',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    }
  });

  return (
    <div className="collapse collapse-arrow rounded-md mb-2">
      <input type="checkbox" className="peer" /> 
      <div className="collapse-title peer-checked:bg-secondary peer-checked:text-secondary-content">
        <div className="flex items-center justify-between">
          <div className="grow md:flex items-center sm:grid sm:grid-flow-row">
            <div className="text">{displayName}</div>
            { !hasUnsavedChanges ? '' :
              <span className="badge badge-primary badge-sm sm:ml-2">
                unsaved changes
              </span> 
            }
          </div>
          <div className="flex">
            <div className="badge badge-success mx-1">
              {displayBuy}%
            </div>
            <div className="badge badge-error mx-1">
              {displaySell}%
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"> 
        <div className="form-control mt-4 text-neutral">
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
            <label className="input-group my-1 w-full">
              <span>Buy</span>
              <input value={buy} onChange={handleBuyChanged} type="text" placeholder="Buy Tax" className="input input-bordered w-full text-end" />
              <span className="bg-success"><Percent className="h-5 w-5"/></span>
            </label>
            <label className="input-group my-1">
              <span>Sell</span>
              <input value={sell} onChange={handleSellChanged} type="text" placeholder="Sell Tax" className="input input-bordered w-full text-end" />
              <span className="bg-error"><Percent className="h-5 w-5"/></span>
            </label>
          </div>
          <label className="input-group my-1 w-full">
            <span>Name</span>
            <input value={name} onChange={handleNameChanged} type="text" placeholder="Tax Name" className="input input-bordered w-full" />
          </label>
          <label className="input-group my-1">
            <span>Wallet</span>
            <input value={wallet} onChange={handleWalletChanged} type="text" placeholder="0xA1b23C...D3e4" className="input input-bordered w-full" />
          </label>
          { !hasUnsavedChanges ? '' :
            <button 
              className={`btn btn-block btn-primary mt-2 ${isLoading || updateInProgress ? 'loading' : ''}`}
              onClick={() => write?.()}
            >
              Update Tax
            </button>
          }
          {
            hasUnsavedChanges && error ?
            <div className="text-xs text-secondary-content flex justify-end mt-1">
              {formatError(error?.toString())}
            </div>
            : ''
          }
        </div>
      </div>
    </div>
  )
}

export default TaxForm;
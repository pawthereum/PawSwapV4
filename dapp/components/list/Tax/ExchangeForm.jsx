import { useContext, useState, useEffect } from "react";
import shortenAddress from "../../../helpers/shortenAddress";
import { ExternalLink } from "react-feather";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { PANCAKESWAP_ROUTER, SAFEMOONSWAP_ROUTER, defaultChainId, TAX_STRUCTURE_ABI, PAWSWAP } from "../../../constants";
import ListContext from "../../../context/ListContext";
import NotificationContext from "../../../context/NotificationContext";
import formatError from "../../../helpers/formatError";

export const ExchangeForm = () => {
  const { chain: connectedChain } = useNetwork();
  const { popNotification } = useContext(NotificationContext);
  const { 
    routerAddress: listedRouterAddress,
    listedTaxStructureAddress,
    taxStructureContractAddress,
  } = useContext(ListContext);
  const [chain, setChain] = useState({ id: defaultChainId });
  const [routerAddress, setRouterAddress] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [updateInProgress, setUpdateInProgress] = useState(false);

  const handleRouterAddressChanged = (e) => {
    setRouterAddress(e.target.value);
  }

  const routerAddressIsChanged = (val1, val2) => {
    return String(val1?.toLowerCase().replace(/\s+/g, "")) !== String(val2?.toLowerCase().replace(/\s+/g, ""));
  }

  const { config, error } = usePrepareContractWrite({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'setRouterAddress',
    args: routerAddress
  });

  const { write, isLoading } = useContractWrite({
    ...config,
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
        title: 'Update Confirmed',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    },
    onError (e) {
      popNotification({
        type: 'error',
        title: 'Update Error',
        description: 
          <div className="flex items-center">
            <span>{e?.toString()}</span>
          </div>
      });
    }
  });

  useEffect(() => {
    setRouterAddress(listedRouterAddress);
  }, [listedRouterAddress]);

  useEffect(() => {
    if (routerAddressIsChanged(routerAddress, listedRouterAddress)) return setHasUnsavedChanges(true);
    return setHasUnsavedChanges(false);
  }, [routerAddress, listedRouterAddress]);

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  return (
    <div className="form-control w-full mt-2">
      <label className="label">
        <span className="label-text text-xs">Router Address</span>
        <span className="label-text-alt">{shortenAddress(routerAddress)}</span>
      </label>
      <input onChange={handleRouterAddressChanged} value={routerAddress} type="text" placeholder="Router Address" className="input input-bordered w-full" />
      <label className="label">
        <span className="label-text-alt">
        </span>
        <span className="label-text-alt">
          <button 
            className={`btn btn-xs ${routerAddress?.toLowerCase() !== PANCAKESWAP_ROUTER[chain?.id]?.address?.toLowerCase() ? 'btn-outline' : ''} mr-2`}
            onClick={() => setRouterAddress(PANCAKESWAP_ROUTER[chain?.id]?.address)}
          >
            Pancakeswap
          </button>
          <button 
            className={`btn btn-xs ${routerAddress?.toLowerCase() !== PAWSWAP[chain?.id]?.address?.toLowerCase() ? 'btn-outline' : ''} mr-2`}
            onClick={() => setRouterAddress(PAWSWAP[chain?.id]?.address)}
          >
            PawSwap
          </button>
          <button 
            className={`btn btn-xs ${routerAddress?.toLowerCase() !== SAFEMOONSWAP_ROUTER[chain?.id]?.address?.toLowerCase() ? 'btn-outline' : ''} mr-2`}
            onClick={() => setRouterAddress(SAFEMOONSWAP_ROUTER[chain?.id]?.address)}
          >
            SafeMoon Swap
          </button>
        </span>
      </label>
      { !hasUnsavedChanges ? '' :
        <button 
          className={`btn btn-block btn-primary mt-2 ${isLoading || updateInProgress ? 'loading' : ''}`}
          onClick={() => write?.()}
          disabled={!write}
        >
          Update Tax
        </button>
      }
      {
        hasUnsavedChanges && error ?
        <div className="text-xs text-secondary-content flex justify-end mt-1">
          {error?.reason ? formatError(error?.reason?.toString()) : error?.toString()}
        </div>
        : ''
      }
    </div>
  )
}

export default ExchangeForm;
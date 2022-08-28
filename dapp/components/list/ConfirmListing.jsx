import { useContext, useEffect, useState, useRef } from "react";
import { Copy, ExternalLink } from "react-feather";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { PAWSWAP, defaultChainId } from "../../constants";
import shortenAddress from "../../helpers/shortenAddress";
import ListContext from "../../context/ListContext";
import NotificationContext from "../../context/NotificationContext";
import formatError from "../../helpers/formatError";

export const ConfirmListing = () => {
  const { listToken, taxStructureContractAddress } = useContext(ListContext);
  const { popNotification } = useContext(NotificationContext);
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const addressRef = useRef(null);
  const [copyText, setCopyText] = useState('Copy');
  const [acknowledged, setAcknowledged] = useState(false);
  const [listInProgress, setListInProgress] = useState(false);

  const handleAcknowledgeChanged = (e) => {
    setAcknowledged(e.target.checked)
  }

  const { config } = usePrepareContractWrite({
    addressOrName: PAWSWAP[chain?.id]?.address,
    contractInterface: PAWSWAP[chain?.id]?.abi,
    functionName: 'setTokenTaxContract',
    args: [listToken?.token?.address, taxStructureContractAddress]
  });

  const { isLoading, write, error } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setListInProgress(true);
      popNotification({
        type: 'success',
        title: 'List Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      popNotification({
        type: 'success',
        title: 'List Confirmed',
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
        title: 'List Error',
        description: 
          <div className="flex items-center">
            <span>{e?.toString()}</span>
          </div>
      });
    }
  })

  const copyToClipboard = (e) => {
    addressRef.current.select();
    document.execCommand('copy');
    setCopyText('Copied!');
    setTimeout(() => {
      setCopyText('Copy');
    }, 3000);
  };

  useEffect(() => {
    if (!connectedChain) {
      setChain({ id: defaultChainId });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-start">
        <input checked={acknowledged} onChange={handleAcknowledgeChanged} type="checkbox" className="checkbox" />
        <span className="ml-2">Check this box once you have excluded PawSwap from taxes</span>
      </div>
      <div className="flex justify-center mt-2">
        <div className="form-control w-full">
          <label class="label">
            <span class="label-text">PawSwap Address</span>
            <span class="label-text-alt">{shortenAddress(PAWSWAP[chain?.id]?.address)}</span>
          </label>
          <label className="input-group">
            <input ref={addressRef} onChange={() => {}} value={PAWSWAP[chain?.id]?.address} type="text" className="input w-full input-bordered" />
            <span 
              className="cursor-pointer"
              onClick={copyToClipboard}
            >
              <Copy className="h-5 w-5 mr-1" />{copyText}
            </span>
          </label>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button 
          className={`btn btn-wide btn-primary ${isLoading || listInProgress ? 'loading' : ''}`}
          onClick={() => { write?.() }}
          disabled={!write}
        >
          List
        </button>
        {
          !error ? '' :
          <div className="text-xs text-secondary-content flex justify-end mt-1">
            {formatError(error?.toString())}
          </div>
        }
      </div>
    </div>
  )
}

export default ConfirmListing;
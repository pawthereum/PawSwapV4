import { useContext, useEffect, useState, useRef } from "react";
import { Copy, ExternalLink } from "react-feather";
import { useContractWrite, useNetwork, usePrepareContractWrite } from "wagmi";
import { PAWSWAP, defaultChainId } from "../../constants";
import shortenAddress from "../../helpers/shortenAddress";
import ListContext from "../../context/ListContext";
import NotificationContext from "../../context/NotificationContext";
import formatError from "../../helpers/formatError";
import { constants } from "ethers";

export const ConfirmListing = () => {
  const { 
    listToken, 
    taxStructureContractAddress,
    listedTaxStructureAddress
  } = useContext(ListContext);
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
      setListInProgress(false);
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
      <div className="w-full my-2">
        <p className="text-lg font-bold text-center mb-2">Finalize Your Listing</p>
        <p>Exclude PawSwap from being taxed by your contract.</p>
        <p className="mt-2">PawSwap will use the Tax Structure that you setup in the previous steps instead of your token&apos;s standard taxes.</p>
      </div>
      <div className="flex items-start">
        <input checked={acknowledged} onChange={handleAcknowledgeChanged} type="checkbox" className="checkbox" />
        <span className="ml-2">Check this box once you have excluded PawSwap from being taxed by your token&apos;s standard taxes</span>
      </div>
      <div className="flex justify-center mt-2">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">PawSwap Address</span>
            <span className="label-text-alt">{shortenAddress(PAWSWAP[chain?.id]?.address)}</span>
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
          disabled={!write || !acknowledged}
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
      { listedTaxStructureAddress === constants.AddressZero ? '' :
        <div className="flex justify-center text-center text-xs mt-2">
          {listToken?.token?.symbol} is currently listed at 
            <a 
              className="ml-1 font-bold"
              target="_blank"
              rel="noopener noreferrer"
              href={chain?.blockExplorers?.default?.url + '/address/' + listedTaxStructureAddress}
            >
              {shortenAddress(listedTaxStructureAddress)}
            </a>
        </div>
      }
      <div className="font-bold text-center text-lg mt-8 mb-2">
        Embed PawSwap on your website!
      </div>
      <div className="mockup-code">
        <pre>
          <code>
            {`<iframe src="https://pawswap.exchange/embed?output=${listToken?.token?.address}" width="100%" height="750px" style="border: none;" allowtransparency="true"></iframe>`}
          </code>
        </pre>
      </div>
    </div>
  )
}

export default ConfirmListing;
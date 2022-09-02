import { useContext, useEffect, useState } from 'react';
import { ChevronRight, ExternalLink } from 'react-feather';
import { useContractWrite, usePrepareContractWrite, useAccount, useNetwork, useContractEvent } from 'wagmi';
import ListContext from '../../context/ListContext';
import { TAX_STRUCTURE_FACTORY, defaultChainId, PANCAKESWAP_ROUTER } from '../../constants';
import NotificationContext from '../../context/NotificationContext';
import shortenAddress from '../../helpers/shortenAddress';
import { constants } from 'ethers';

export const LaunchContract = () => {
  const { popNotification } = useContext(NotificationContext);
  const { 
    listedTaxStructureAddress,
    taxStructureContractAddress,
    updateTaxStructureContractAddress,
    nextStep,
  } = useContext(ListContext);
  const { address } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ 
    id: defaultChainId,
    blockExplorers: {
      default: {
        url: 'https://bscscan.com/'
      }
    } 
  });
  const [onChainTaxStruct, setOnChainTaxStruct] = useState(null);
  const [deployInProgress, setDeployInProgress] = useState(false);

  // listen for new deploys and if we find one that was deployed
  // by the connected address, set the tax structure in context to
  // the deployed contract
  useContractEvent({
    addressOrName: TAX_STRUCTURE_FACTORY[chain?.id]?.address || TAX_STRUCTURE_FACTORY['default']?.address,
    contractInterface: TAX_STRUCTURE_FACTORY[chain?.id]?.abi || TAX_STRUCTURE_FACTORY['default']?.abi,
    eventName: 'Deploy',
    listener: (event) => {
      if (event[1] === address) {
        updateTaxStructureContractAddress(event[0]);
      }
    }
  });

  const handleInputChanged = (e) => {
    updateTaxStructureContractAddress(e.target.value);
  }

  useEffect(() => {
    if (!connectedChain) {
      setChain({ 
        id: defaultChainId,
        blockExplorers: {
          default: {
            url: 'https://bscscan.com/'
          }
        }
      });
    } else {
      setChain(connectedChain);
    }
  }, [connectedChain]);

  const { config } = usePrepareContractWrite({
    addressOrName: TAX_STRUCTURE_FACTORY[chain?.id]?.address,
    contractInterface: TAX_STRUCTURE_FACTORY[chain?.id]?.abi,
    functionName: 'deployTaxStructure',
    args: [
      parseInt(new Date().getMinutes()), // psuedo random salt
      PANCAKESWAP_ROUTER[chain?.id]?.address
    ]
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setDeployInProgress(true);
      popNotification({
        type: 'success',
        title: 'Deploy Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      setDeployInProgress(false);
      popNotification({
        type: 'success',
        title: 'Deploy Confirmed',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    },
    onError(e) {
      popNotification({
        type: 'error',
        title: 'Deploy Error',
        description: 
          <div className="flex items-center">
            <span>{e?.toString()}</span>
          </div>
      });
    }
  });

  useEffect(() => {
    setOnChainTaxStruct(listedTaxStructureAddress);
  }, [listedTaxStructureAddress]);

  return (
    <div className="grid grid-flow-row gap-2">
      <div>
        <label className="label flex justify-end pb-0">
          <span className="label-text text-right">
            { taxStructureContractAddress 
              ? shortenAddress(taxStructureContractAddress)
              : 'Paste existing or deploy new'
            }
          </span>
        </label>
        <input 
          type="text" 
          onChange={handleInputChanged}
          value={taxStructureContractAddress || ''}
          placeholder="0xa1B2c...D3e4"
          className="input shadow-inner bg-base-200 hover:bg-base-300 focus:outline-0 input-lg w-full" 
        />
        {!onChainTaxStruct || onChainTaxStruct === constants.AddressZero ? '' :
          <label className="label flex justify-end pb-0">
            <span className="label-text text-right">
              Launched at: 
              <a 
                className="ml-1 font-bold"
                target="_blank"
                rel="noopener noreferrer"
                href={chain?.blockExplorers?.default?.url + '/address/' + onChainTaxStruct}
              >
                {shortenAddress(onChainTaxStruct)}
              </a>
            </span>
          </label>
        }
      </div>
      { !taxStructureContractAddress 
        ? 
          onChainTaxStruct !== constants.AddressZero
          ?
            <div>
              <button 
                className={`btn btn-lg btn-wide btn-primary ${isLoading || deployInProgress ? 'loading' : ''}`}
                disabled={!write}
                onClick={() => write?.()}
              >
                Launch New Tax Structure Contract
              </button>
              <div className="w-full flex justify-center mt-2">
                <a className="btn btn-outline btn-primary btn-lg btn-wide" onClick={() => nextStep()}>
                  Next <ChevronRight className="h-5 w-5" />
                </a>
              </div>
            </div>
          :
            <button 
              className={`btn btn-lg btn-wide btn-primary ${isLoading || deployInProgress ? 'loading' : ''}`}
              disabled={!write}
              onClick={() => write?.()}
            >
              Launch New Tax Structure Contract
            </button>
        :
          <div className="w-full flex justify-center mt-2">
            <a className="btn btn-primary btn-lg btn-wide" onClick={() => nextStep()}>
              Next <ChevronRight className="h-5 w-5" />
            </a>
          </div>
      }
    </div>
  )
}

export default LaunchContract;
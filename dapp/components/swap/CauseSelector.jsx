import { useContext, useEffect, useMemo, useState } from 'react';
import { ChevronDown, X } from 'react-feather';
import useGetCustomWallets from '../../hooks/useCustomWallets';
import CauseSearchResult from './CauseSelector/CauseSearchResult';
import { useAccount } from 'wagmi';
import SwapContext from '../../context/SwapContext';

export const CauseSelector = (() => {
  const { address } = useAccount();
  const { cause, updateCause, updateCauseAmount } = useContext(SwapContext); 
  const [causeAmount, setCauseAmount] = useState('');
  const [causeQuery, setCauseQuery] = useState('');
  const [executeQuery, setExecuteQuery] = useState(false);
  const apiResp = useGetCustomWallets(causeQuery, [], executeQuery);

  const handleCauseQueryChange = (e) => {
    setCauseQuery(e.target.value);
  }

  const handleCauseAmountChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setCauseAmount(e.target.value);
  }

  const selectedCause = useMemo(() => {
    return cause || 'Select Cause';
  }, [cause]);

  const clearCause = () => {
    updateCause(null);
  }

  useEffect(() => {
    updateCauseAmount(causeAmount);
  }, [causeAmount]);

  useEffect(() => {
    // time delay for a search so user stops typing
    setTimeout(() => {
      setExecuteQuery(true);
    }, 1000);
  }, [causeQuery]);

  useEffect(() => {
    setExecuteQuery(false);
  }, [apiResp]);

  const SelectedCauseDisplayName = ({ cause }) => {
    const MAX_NAME_LENGTH = 20;
    if (cause?.name?.length <= cause?.symbol?.length) {
      return (
        <span>{cause?.name}</span>
      );
    }
    if (cause?.symbol?.length < MAX_NAME_LENGTH && cause?.name?.length < MAX_NAME_LENGTH) {
      return (
        <span>{cause?.name}</span>
      );
    }
    return (
      <span className="uppercase">{cause?.symbol}</span>
    )
  }

  const SelectedCauseImg = ({ cause }) => {
    if (!cause || cause === address) return (<></>);
    if (cause === 'Select Cause') return (<></>);
    return (
      <div className="avatar w-5 h-5">
        <div className="rounded-full">
          <img 
            height="28px"
            width="28px"
            src={cause?.logo || cause?.icon}
          />        
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-flow-row auto-rows-auto">
      <div className="flex bg-base-200 rounded-lg items-center shadow-inner">
        <input 
          type="text" 
          placeholder="Type here" 
          value={causeAmount}
          onChange={handleCauseAmountChanged}
          className="shadow-inner clip-right input bg-base-200 hover:bg-base-300 focus:outline-0 rounded-r-none input-lg w-full" 
        />
        <label htmlFor="cause-selector" className="btn modal-button shadow-inner clip-left sm:btn-lg btn-ghost bg-base-200 hover:bg-base-300 rounded-l-none min-h-full">
          <SelectedCauseImg cause={selectedCause}/>
          <span className="ml-1">{selectedCause?.symbol ? <SelectedCauseDisplayName cause={selectedCause} />: <span>Select Cause</span>}</span>
          <ChevronDown className="h-5 w-5 ml-1" />
        </label>
        <input type="checkbox" id="cause-selector" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle">
          <div className="modal-box">
            <div className="flex justify-between">
              <h3 className="font-bold text-lg">Select Cause</h3>
              <label htmlFor="cause-selector" className="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"><X/></label>
            </div>
            <input 
              type="text" 
              placeholder="Search for Cause" 
              className="shadow-inner input bg-base-200 hover:bg-base-300 focus:outline-0 input-lg w-full"
              onChange={handleCauseQueryChange}
              value={causeQuery}
            />
            <CauseSearchResult results={apiResp} />
          </div>
        </div>
      </div>
      <div className="flex justify-end w-full">
        { selectedCause === 'Select Cause' || selectedCause === address || !selectedCause ? <></> :
          <div 
            className="badge badge-sm badge-ghost cursor-pointer gap-2 mt-2"
            onClick={() => clearCause()}
          >
            <X className="h-3 w-3" />
            {selectedCause?.name}
          </div>
        }
      </div>
    </div>
  )
})

export default CauseSelector;
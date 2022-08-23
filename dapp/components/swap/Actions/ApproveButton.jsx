import { useContext, useEffect, useState } from 'react';
import { erc20ABI, useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useNetwork } from 'wagmi';
import { defaultChainId, PAWSWAP, NATIVE_ADDRESS } from '../../../constants';
import { BigNumber, constants } from 'ethers';
import { ExternalLink } from 'react-feather';
import SwapContext from '../../../context/SwapContext';
import NotificationContext from '../../../context/NotificationContext';

// TODO: sometimes an approval tx will pop up twice

export const ApproveButton = () => {
  const {
    inputAmount,
    inputToken,
  } = useContext(SwapContext);
  const { popNotification } = useContext(NotificationContext);
  const { address, isConnected } = useAccount();
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [allowance, setAllowance] = useState(0);
  const [hasSufficientAllowance, setHasSufficientAllowance] = useState(true);
  const [approvalAmount, setApprovalAmount] = useState(null);
  const [approvalInProgress, setApprovalInProgress] = useState(false);
  const [activeBtn, setActiveBtn] = useState(null);

  const { data: allowanceData, isFetched: allowanceIsFetched, refetch: refetchApproval } = useContractRead({
    addressOrName: inputToken?.token?.address,
    contractInterface: erc20ABI,
    functionName: 'allowance',
    args: [address, PAWSWAP[chain?.id]?.address],
    watch: true,
  });

  const { config: approveConfig, isLoading: approvalIsLoading } = usePrepareContractWrite({
    addressOrName: inputToken?.token?.address,
    contractInterface: erc20ABI,
    functionName: 'approve',
    args: [PAWSWAP[chain?.id]?.address, approvalAmount]
  });

  const { write: approve } = useContractWrite({
    ...approveConfig,
    async onSettled () {
      setApprovalAmount(null);
      const refetchedApproval = await refetchApproval();
      setAllowance(refetchedApproval?.data);
      checkHasSufficientAllowance();
    },
    onSuccess (data) {
      popNotification({
        type: 'success',
        title: 'Approval Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });

      data.wait().then(() => {
        setActiveBtn(null);
        setApprovalInProgress(false);

        popNotification({
          type: 'success',
          title: 'Approval Confirmed',
          description: 
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ,
          link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
        });
      });
    },
    onError (error) {
      setActiveBtn(null);
      setApprovalInProgress(false);
    }
  });

  const checkHasSufficientAllowance = async () => {
    if (!inputAmount) return setHasSufficientAllowance(true);
    setHasSufficientAllowance(
      BigNumber.from(allowance?.toString() || '0').gte(
        BigNumber.from(inputAmount?.raw?.toString() || '0')
      )
    );
  }

  useEffect(() => {
    if (approvalAmount === null) return;
    approve?.();
    setApprovalInProgress(true);
  }, [approve]);

  const approveThisSwap = async () => {
    setActiveBtn('this');
    // this will trigger a useEffect hook once the approval amount is updated
    // which will call the approve function
    setApprovalAmount(inputAmount?.raw?.toString());
  }

  const approveAllSwaps = async () => {
    setActiveBtn('all');
    // this will trigger a useEffect hook once the approval amount is updated
    // which will call the approve function
    setApprovalAmount(constants.MaxUint256);
  }

  useEffect(() => {
    setAllowance(allowanceData);
  }, [allowanceIsFetched]);

  useEffect(() => {
    if (!inputToken) return;
    if (inputToken?.token?.address?.toLowerCase() === NATIVE_ADDRESS) return setHasSufficientAllowance(true);
    if (!allowance) return setHasSufficientAllowance(false);
    checkHasSufficientAllowance();
  }, [allowance, inputAmount, inputToken]);

  useEffect(() => {
    if (isConnected && connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [isConnected, connectedChain]);

  if (hasSufficientAllowance) return (<></>);

  return (
    <div>
      <div className="flex mb-2">
        <div className="w-full mr-1">
          <button 
            className={`btn btn-primary btn-outline btn-block btn-lg ${(approvalIsLoading || approvalInProgress) && activeBtn === 'this' ? 'loading' : ''}`}
            onClick={() => approveThisSwap()}
          >
            Approve This {inputToken?.token?.symbol || ''} Swap
          </button>
        </div>
        <div className="w-full ml-1">
          <button 
            className={`btn btn-primary btn-block btn-lg ${(approvalIsLoading || approvalInProgress) && activeBtn === 'all' ? 'loading' : ''}`}
            onClick={() => approveAllSwaps()}
          >
            Approve All {inputToken?.token?.symbol || ''} Swaps
          </button>
        </div>
      </div>
      <div className="collapse collapse-arrow col-span-2 rounded-md">
        <input type="checkbox" className="peer" /> 
        <div className="collapse-title peer-checked:bg-secondary peer-checked:text-secondary-content">
          What is the difference?
        </div>
        <div className="collapse-content text-sm peer-checked:bg-secondary peer-checked:text-secondary-content"> 
          <p className="mb-2">Approving this swap will only permit PawSwap to spend the necessary amount of {inputToken?.token?.symbol || 'this token'} to execute this trade. You will need to approve again if you want to execute more trades.</p>
          <p className="mb-2">If you choose to approve all swaps, you will not need to execute future approval transactions.</p>
          <p className="mb-2">&quot;Approve All Swaps&quot; is a more convienent user experience but &quot;Approve This Swap&quot; is generally considered better wallet hygiene.</p>
        </div>
      </div>
    </div>
  )
}

export default ApproveButton;
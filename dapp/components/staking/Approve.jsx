import { useState, useContext } from "react";
import { usePrepareContractWrite, useContractWrite, erc20ABI } from "wagmi";
import { STAKING } from "../../constants";
import { constants } from 'ethers';
import { tokenList } from '../../constants/tokenList';
import NotificationContext from '../../context/NotificationContext';

const Approve = ({ chain, callback }) => {
  const { popNotification } = useContext(NotificationContext);
  const [approvalInProgress, setApprovalInProgress] = useState(false);

  const { config } = usePrepareContractWrite({
    addressOrName: tokenList.tokens.find(t => t.isPawthereum && t.chainId === chain?.id)?.address,
    contractInterface: erc20ABI,
    functionName: "approve",
    args: [STAKING[chain?.id]?.address, constants.MaxUint256]
  });

  const SuccessNotification = () => (
    <div className="flex items-center">
      <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
      <ExternalLink className="ml-1 h-5 w-5" />
    </div>
  );

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setApprovalInProgress(true);
      popNotification({
        type: 'success',
        title: 'Approval Submitted',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait()
      await callback();
      setApprovalInProgress(false);
      popNotification({
        type: 'success',
        title: 'Approval Confirmed!',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    }
  });

  return (
    <button 
      className={`btn btn-block btn-lg btn-primary ${isLoading || approvalInProgress ? 'loading' : ''}`}
      onClick={() => write?.()}
    >
      Approve
    </button>
  )
}

export default Approve;
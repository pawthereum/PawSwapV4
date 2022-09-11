import { useState } from "react";
import { usePrepareContractWrite, useContractWrite, erc20ABI } from "wagmi";
import { STAKING } from "../../constants";
import { constants } from 'ethers';
import { tokenList } from '../../constants/tokenList';

const Approve = ({ chain, callback }) => {
  const [approvalInProgress, setApprovalInProgress] = useState(false);

  const { config } = usePrepareContractWrite({
    addressOrName: tokenList.tokens.find(t => t.isPawthereum && t.chainId === chain?.id)?.address,
    contractInterface: erc20ABI,
    functionName: "approve",
    args: [STAKING[chain?.id]?.address, constants.MaxUint256]
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setApprovalInProgress(true);
      await data.wait()
      await callback();
      setApprovalInProgress(false);
    }
  });

  return (
    <button 
      className={`btn btn-block xl:btn-md btn-primary ${isLoading || approvalInProgress ? 'loading' : ''}`}
      onClick={() => write?.()}
    >
      Approve
    </button>
  )
}

export default Approve;
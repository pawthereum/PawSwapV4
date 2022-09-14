import { useState } from 'react';
import { usePrepareContractWrite, useContractWrite, useContractRead } from "wagmi";
import { STAKING } from '../../constants';

const Claim = ({ chain, callback }) => {
  const [inProgress, setInProgress] = useState(false);

  const { data: performanceFee } = useContractRead({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'performanceFee',
  });
  
  const { config } = usePrepareContractWrite({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'claimReward',
    overrides: {
      value: performanceFee
    }
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setInProgress(true);
      await data.wait();
      setInProgress(false);
      callback();
    },
    onError (e) {
      console.log(e);
    }
  });

  return (
    <button 
      className={`btn btn-block btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
      onClick={() => write?.()}
      disabled={!write}
    >
      Claim
    </button>
  )
}

export default Claim;
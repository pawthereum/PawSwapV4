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
    <div className="grid grid-flow-row gap-2">
      <div className="font-bold">
        Claim Rewards
      </div>
      <div className="text-left text-sm">
        Extract your reward from the staking contract to your wallet
      </div>
      <button 
        className={`btn btn-block btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
        onClick={() => write?.()}
        disabled={!write}
      >
        Claim Profit
      </button>
      <div className="font-bold mt-4">
        Claim Reflections
      </div>
      <div className="text-left text-sm">
        Extract your reflections from the staking contract to your wallet.
      </div>
      <button 
        className={`btn btn-block btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
        onClick={() => write?.()}
        disabled={!write}
      >
        Claim Reflections
      </button>
      <button 
        className={`btn btn-block btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
        onClick={() => write?.()}
        disabled={!write}
      >
        Compound Profit
      </button>
    </div>
  )
}

export default Claim;
import { useState } from 'react';
import { useContractRead } from "wagmi";
import { STAKING } from '../../constants';
import RewardButton from './RewardButton';

const Claim = ({ chain, callback, functionName, btnLabel }) => {
  const [inProgress, setInProgress] = useState(false);

  const { data: performanceFee } = useContractRead({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'performanceFee',
  });


  return (
    <div className="grid grid-flow-row gap-2">
      <div className="font-bold">
        Claim
      </div>
      <div className="text-left text-sm">
        Extract your tokens from the staking contract to your wallet
      </div>
      <RewardButton
        fee={performanceFee}
        chain={chain}
        callback={callback}
        functionName={'claimReward'}
        btnLabel={'Claim Rewards'}
      />
      <RewardButton
        fee={performanceFee}
        chain={chain}
        callback={callback}
        functionName={'claimDividend'}
        btnLabel={'Claim Reflections'}
      />
      <div className="font-bold mt-4">
        Compound
      </div>
      <div className="text-left text-sm">
        Stake your earned and reflected tokens back into the contract to increase your staked position
      </div>
      <RewardButton
        fee={performanceFee}
        chain={chain}
        callback={callback}
        functionName={'compoundReward'}
        btnLabel={'Compound Rewards'}
      />
      <RewardButton
        fee={performanceFee}
        chain={chain}
        callback={callback}
        functionName={'compoundDividend'}
        btnLabel={'Compound Reflections'}
      />
    </div>
  )
}

export default Claim;
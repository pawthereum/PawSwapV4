import { useState, useContext } from 'react';
import { usePrepareContractWrite, useContractWrite } from "wagmi";
import { STAKING } from '../../constants';
import formatError from '../../helpers/formatError';
import NotificationContext from '../../context/NotificationContext';
import { ExternalLink } from 'react-feather';

const RewardButton = ({ chain, callback, functionName, btnLabel, fee }) => {
  const { popNotification } = useContext(NotificationContext);
  const [inProgress, setInProgress] = useState(false);
  
  const SuccessNotification = () => (
    <div className="flex items-center">
      <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
      <ExternalLink className="ml-1 h-5 w-5" />
    </div>
  );

  const { config } = usePrepareContractWrite({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName,
    overrides: {
      value: fee
    }
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setInProgress(true);
      popNotification({
        type: 'success',
        title: `${btnLabel} Submitted`,
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      setInProgress(false);
      callback();
      popNotification({
        type: 'success',
        title: `${btnLabel} Confirmed!`,
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    },
    onError (e) {
      console.log(e);
      popNotification({
        type: 'error',
        title: 'Withdrawl Error',
        description: formatError(error),
      });
    }
  });

  return (
    <div className="grid grid-flow-row gap-2">
      <button 
        className={`btn btn-block btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
        onClick={() => write?.()}
        disabled={!write}
      >
        {btnLabel}
      </button>
    </div>
  )
}

export default RewardButton;
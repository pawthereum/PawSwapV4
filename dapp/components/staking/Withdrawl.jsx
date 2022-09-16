import Image from 'next/image';
import { useState, useContext } from 'react';
import logo from '../../public/img/logo-icon.svg';
import { utils } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { PAWTH_DECIMALS, STAKING } from '../../constants';
import formatError from '../../helpers/formatError';
import NotificationContext from '../../context/NotificationContext';
import { ExternalLink } from 'react-feather';

const Withdraw = ({ stakedBalance, chain, callback }) => {
  const { popNotification } = useContext(NotificationContext);
  const [amount, setAmount] = useState('');
  const [inProgress, setInProgress] = useState(false);

  const SuccessNotification = () => (
    <div className="flex items-center">
      <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
      <ExternalLink className="ml-1 h-5 w-5" />
    </div>
  );

  const max = () => {
    setAmount(utils.formatEther(stakedBalance?.toString()));
  }

  const handleChangeAmount = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setAmount(e.target.value);
  }

  const { config, error } = usePrepareContractWrite({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'withdraw',
    args: [utils.parseUnits(amount || '0', PAWTH_DECIMALS)],
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setInProgress(true);
      popNotification({
        type: 'success',
        title: 'Withdrawl Submitted',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      callback();
      popNotification({
        type: 'success',
        title: 'Withdrawl Confirmed',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      setInProgress(false);
      setAmount('');
    },
    onError (error) {
      popNotification({
        type: 'error',
        title: 'Withdrawl Error',
        description: formatError(error),
      });
    }
  });

  return (
    <div className="grid grid-flow-row gap-2">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-2">
        <div className="col-span-1 xl:col-span-9">
        <div className="relative rounded-sm shadow-sm">
          <div className="absolute inset-y-0 ml-3 flex items-center">
            <Image
              src={logo}
              height={20}
              width={20}
            />
          </div>
          <input 
            value={amount}
            onChange={handleChangeAmount} 
            className="input input-lg w-full pl-10 shadow-inner bg-base-200 focus:outline-0" 
            placeholder="Withdraw"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="badge badge-lg badge-primary mr-2 cursor-pointer" onClick={max}>Max</div>
          </div>
        </div>
        </div>
        <div className="col-span-1 xl:col-span-3">
          <button 
            className={`btn btn-block btn-lg btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
            onClick={() => write?.()}
            disabled={!write}
          >
            Withdraw
          </button>
        </div>
      </div>
      <div className="w-full flex justify-end">
        {error && <div className="text-error text-opacity-50 text-xs">{formatError(error)}</div>}
      </div>
    </div>
  )
}

export default Withdraw;
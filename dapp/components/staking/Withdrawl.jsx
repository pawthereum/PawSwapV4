import Image from 'next/image';
import { useState } from 'react';
import logo from '../../public/img/logo-icon.svg';
import { utils } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { STAKING } from '../../constants';
import formatError from '../../helpers/formatError';

const Withdraw = ({ stakedBalance, chain, callback }) => {
  const [amount, setAmount] = useState('');
  const [inProgress, setInProgress] = useState(false);

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
    args: [utils.parseEther(amount || '0')],
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setInProgress(true);
      await data.wait();
      callback();
      setInProgress(false);
      setAmount('');
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
            className="input w-full pl-10" 
            placeholder="Withdraw"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="badge badge-primary mr-2 cursor-pointer" onClick={max}>Max</div>
          </div>
        </div>
        </div>
        <div className="col-span-1 xl:col-span-3">
          <button 
            className={`btn btn-block xl:btn-md btn-primary ${isLoading || inProgress ? 'loading' : ''}`}
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
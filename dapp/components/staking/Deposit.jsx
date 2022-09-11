import Image from 'next/image';
import { useEffect, useState } from 'react';
import logo from '../../public/img/logo-icon.svg';
import { utils } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { STAKING, PAWTH_DECIMALS } from '../../constants';
import formatError from '../../helpers/formatError';
import Approve from './Approve';

const Deposit = ({ tokenBalance, chain, callback }) => {
  const [amount, setAmount] = useState('');
  const [depositInProgress, setDepositInProgress] = useState(false);
  const [insufficientAllowance, setInsufficentAllowance] = useState(false);

  const maxDeposit = () => {
    setAmount(utils.formatUnits(tokenBalance?.toString() || '0', PAWTH_DECIMALS));
  }

  const handleChangeAmount = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setAmount(e.target.value);
  }

  const { config, error, refetch } = usePrepareContractWrite({
    addressOrName: STAKING[chain?.id]?.address,
    contractInterface: STAKING[chain?.id]?.abi,
    functionName: 'deposit',
    args: [utils.parseUnits(amount || '0', PAWTH_DECIMALS)],
  });

  const { write, isLoading } = useContractWrite({
    ...config,
    async onSuccess (data) {
      setDepositInProgress(true);
      await data.wait();
      callback();
      setAmount('');
      setDepositInProgress(false);
    }
  });

  useEffect(() => {
    if (!error) return setInsufficentAllowance(false);
    if (formatError(error) === 'ERC20: transfer amount exceeds allowance') {
      setInsufficentAllowance(true);
    } else {
      setInsufficentAllowance(false);
    }
  }, [error]);

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
            placeholder="Deposit"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="badge badge-primary mr-2 cursor-pointer" onClick={maxDeposit}>Max</div>
          </div>
        </div>
        </div>
        <div className="col-span-1 xl:col-span-3">
          {insufficientAllowance ? (
            <Approve chain={chain} callback={refetch} />
          )
          : (
            <button 
              className={`btn btn-block xl:btn-md btn-primary ${isLoading || depositInProgress ? 'loading' : ''}`}
              onClick={() => write?.()}
              disabled={!write}
            >
              Deposit
            </button>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end">
        {!insufficientAllowance && error && <div className="text-error text-opacity-50 text-xs">{formatError(error)}</div>}
      </div>
    </div>
  )
}

export default Deposit;
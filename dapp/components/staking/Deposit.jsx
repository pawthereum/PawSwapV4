import Image from 'next/image';
import { useEffect, useState, useContext } from 'react';
import logo from '../../public/img/logo-icon.svg';
import { utils } from 'ethers';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import { STAKING, PAWTH_DECIMALS } from '../../constants';
import formatError from '../../helpers/formatError';
import Approve from './Approve';
import NotificationContext from '../../context/NotificationContext';
import { ExternalLink } from 'react-feather';

const Deposit = ({ tokenBalance, chain, callback }) => {
  const { popNotification } = useContext(NotificationContext);
  const [amount, setAmount] = useState('');
  const [depositInProgress, setDepositInProgress] = useState(false);
  const [insufficientAllowance, setInsufficentAllowance] = useState(false);


  const SuccessNotification = () => (
    <div className="flex items-center">
      <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
      <ExternalLink className="ml-1 h-5 w-5" />
    </div>
  );

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
      popNotification({
        type: 'success',
        title: 'Deposit Submitted',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      await data.wait();
      callback();
      setAmount('');
      setDepositInProgress(false);
      popNotification({
        type: 'success',
        title: 'Deposit Confirmed!',
        description: SuccessNotification,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
    },
    onError(error) {
      popNotification({
        type: 'error',
        title: 'Deposit Error',
        description: formatError(error),
      });
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

  const ignoreError = (error) => {
    const errorMessage = formatError(error);
    if (errorMessage === 'Amount should be greater than 0') {
      return true;
    }
    return false;
  } 

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
            className="input input-lg w-full pl-10 bg-base-200 shadow-inner focus:outline-0" 
            placeholder="Deposit"
          />
          <div className="absolute inset-y-0 right-0 flex items-center">
            <div className="badge badge-lg badge-primary mr-2 cursor-pointer" onClick={maxDeposit}>Max</div>
          </div>
        </div>
        </div>
        <div className="col-span-1 xl:col-span-3">
          {insufficientAllowance ? (
            <Approve chain={chain} callback={refetch} />
          )
          : (
            <button 
              className={`btn btn-block btn-lg btn-primary ${isLoading || depositInProgress ? 'loading' : ''}`}
              onClick={() => write?.()}
              disabled={!write}
            >
              Deposit
            </button>
          )}
        </div>
      </div>
      <div className="w-full flex justify-end">
        {!insufficientAllowance && error && !ignoreError(error) && <div className="text-error text-opacity-50 text-xs">{formatError(error)}</div>}
      </div>
    </div>
  )
}

export default Deposit;
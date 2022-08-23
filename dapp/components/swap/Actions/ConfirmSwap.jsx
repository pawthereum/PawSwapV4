import Image from 'next/image';
import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { usePrepareContractWrite, useContractWrite } from 'wagmi';
import placeholder from '../../../public/img/placeholder.jpeg';
import { utils } from 'ethers';
import { ArrowDown, ArrowUpCircle, CheckCircle, ExternalLink, X } from 'react-feather';
import TradeDetails from '../TradeDetails';
import formatWithCommas from '../../../helpers/formatWithCommas';
import NotificationContext from '../../../context/NotificationContext';

export const ConfirmSwap = memo(({ 
  prepareConfig,
  cause,
  chain,
  trade,
  params
}) => {
  const { popNotification } = useContext(NotificationContext);
  const [swapInProgress, setSwapInProgress] = useState(false);
  const [swapSubmitted, setSwapSubmitted] = useState(false);
  const [swapComplete, setSwapComplete] = useState(false);
  const [txLink, setTxLink] = useState(null);

  const { config } = usePrepareContractWrite({
    ...prepareConfig
  });

  console.log({ prepareConfig })

  const { write, isLoading } = useContractWrite({
    ...config,
    onSuccess (data) {
      setSwapInProgress(true);
      setSwapSubmitted(true);
      setTxLink(`${chain?.blockExplorers?.default?.url}/tx/${data.hash}`);
      popNotification({
        type: 'success',
        title: 'Swap Submitted',
        description: 
          <div className="flex items-center">
            <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
            <ExternalLink className="ml-1 h-5 w-5" />
          </div>
        ,
        link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
      });
      data.wait().then(() => {
        setSwapInProgress(false);
        setSwapSubmitted(false);
        setSwapComplete(true);
        popNotification({
          type: 'success',
          title: 'Swap Complete',
          description: 
            <div className="flex items-center">
              <span className="mt-1">{`View on ${chain?.blockExplorers?.default?.name}`}</span> 
              <ExternalLink className="ml-1 h-5 w-5" />
            </div>
          ,
          link: `${chain?.blockExplorers?.default?.url}/tx/${data.hash}`
        });
      });
    },
    onError (error) {
      console.log({ error })
    }
  });

  const fromAmount = useMemo(() => {
    if (params.isExactIn) {
      return !params.inputAmount ? 'Loading...' : params.inputAmount?.toSignificant(params.inputToken?.token?.decimals);
    }
    return utils.formatUnits(
      trade?.calculatedAmount?.raw?.toString() || '0',
      params.inputToken?.token?.decimals || 18
    );
  }, [params.isExactIn, params.inputAmount, params.inputToken, trade]);

  const toAmount = useMemo(() => {
    if (params.isExactIn) {
      return utils.formatUnits(
        trade?.calculatedAmount?.raw?.toString() || '0',
        params.outputToken?.token?.decimals || 18
      );
    }

    return !params.outputAmount ? 'Loading...' : params.outputAmount?.toSignificant(params.outputToken?.token?.decimals);
  }, [params.isExactIn, params.outputAmount, params.outputToken, trade]);

  const estimationDisclaimer = useMemo(() => {
    if (params.isExactIn) {
      return `Output is estimated. You will receive at least ${formatWithCommas(
        utils.formatUnits(
          trade?.calculatedAmountWithSlippage?.raw?.toString() || '0',
          params.outputToken?.token?.decimals
        )
      )} ${params.outputToken?.token?.symbol} or the transaction will revert.`;
    }
    if (!params.isExactIn) {
      return `Input is estimated. You will spend at most ${formatWithCommas(
        utils.formatUnits(
          trade?.calculatedAmountWithSlippage?.raw?.toString() || '0',
          params.inputToken?.token?.decimals
        )
      )} ${params.inputToken?.token?.symbol} or the transaction will revert.`;
    }
    return '';
  }, [trade, params.isExactIn, params.isBuy, prepareConfig]);

  ConfirmSwap.displayName = "ConfirmSwap";

  const TokenImage = ({ img }) => {
    if (!img) return (
      <Image
        src={placeholder}
        height={30}
        width={25}
      />
    )
    return (
      <Image
        src={img}
        height={25}
        width={25}
      />
    )
  }
  const CauseImage = ({ cause }) => {
    if (!cause) return (
      <img
        src={placeholder}
        height={16}
        width={12}
      />
    )
    return (
      <img
        src={cause?.logo || cause?.icon}
        height={12}
        width={12}
      />
    )
  }

  const ConfirmContent = () => {
    if (swapSubmitted || swapComplete) return (
      <div className="modal-box">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-xl">Swap {swapComplete ? 'Completed' : 'Confirmed'}</h3>
          <label htmlFor="confirm-swap-modal" className="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"><X/></label>
        </div>
        <div className="h-full w-full flex items-center justify-center">
          <div className="grid grid-flow-row gap-2">
            <div className="text-primary mx-auto">
              {swapComplete ? <CheckCircle className="h-16 w-16"/> : <ArrowUpCircle className="h-16 w-16"/> }
            </div>
            <div>
              <span className="text-lg">Transaction {swapComplete ? 'Complete' : 'Submitted'}</span>
            </div>
            <div className="text-primary mx-auto">
              <a 
                href={txLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>View on BSC Scan</span>
              </a>
            </div>
            <div className="text-xs mx-auto mt-8">
              <span>It is safe to close this modal</span>
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <div className="modal-box">
        <div className="flex justify-between mb-4">
          <h3 className="font-bold text-xl">Confirm Swap</h3>
          <label 
            htmlFor="confirm-swap-modal" 
            className="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"
            onClick={() => {console.log('clicked')}}
          >
            <X/>
          </label>
        </div>
        <div className="grid grid-rows-3 gap-2 text-lg">
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="avatar mr-2">
                <div className="w-6 rounded-full">
                  <TokenImage img={params.inputToken?.logoURI} />
                </div>
              </div>
              <div>
                {formatWithCommas(fromAmount)}
              </div>
            </div>
            <div>
              {params.inputToken?.token?.symbol || 'Loading...'}
            </div>
          </div>
          <div className="flex items-center">
            <div>
              <ArrowDown className="h-5 w-5" />
            </div>
            { cause?.name && params.causeAmount 
              ? 
                <div className="flex items-center ml-3 text-sm">
                  <div>
                    {params.causeAmount?.toString()}% donated to
                  </div>
                  <div className="flex items-center">
                    <div className="avatar mx-1">
                      <div className="w-4 rounded-full">
                        <CauseImage cause={cause} />
                      </div>
                    </div>
                    <span>{cause?.name}</span>
                  </div>
                </div>
              : ''
            }
          </div>
          <div className="flex justify-between">
            <div className="flex items-center">
              <div className="avatar mr-2">
                <div className="w-6 rounded-full">
                  <TokenImage img={params.outputToken?.logoURI} />
                </div>
              </div>
              <div>
                {formatWithCommas(toAmount)}
              </div>
            </div>
            <div>
              {params.outputToken?.token?.symbol || 'Loading...'}
            </div>
          </div>
        </div>
        <div className="grid grid-rows-1 gap-2 my-4">
          {estimationDisclaimer || 'Loading...'}
        </div>
        <TradeDetails trade={trade} slippage={params.slippage} />
        <div className="modal-action">
          <button 
            className={`btn btn-primary btn-block btn-lg no-animation ${isLoading || swapInProgress || !write ? 'loading' : ''}`}
            onClick={() => write?.()}
            disabled={!write}
          >
            Confirm Swap
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <label 
        htmlFor="confirm-swap-modal"
        className="btn btn-primary btn-block btn-lg mt-4"
        onClick={() => setSwapComplete(false)}
      >
        Swap
      </label>
      <input type="checkbox" id="confirm-swap-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <ConfirmContent/>
      </div>
    </>
  )
});

export default ConfirmSwap;
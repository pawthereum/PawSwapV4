import { useMemo } from "react";
import { useAccount } from "wagmi";

export const ErrorMessage = ({ error }) => {
  const { isConnected } = useAccount();

  const errorMessage = useMemo(() => {
    if (!isConnected) {
      return 'Connect Wallet'
    }

    if (!error?.name) {
      return error?.reason || 'Unknown Error'
    }

    switch (error?.name) {
      case 'InsufficientReservesError':
        return 'Insufficient Liquidity'
      default:
        return error?.name
    }
  }, [error])
  return (
    <button className="btn btn-block btn-disabled btn-lg">
      {errorMessage || ''}
    </button>
  )
}

export default ErrorMessage;
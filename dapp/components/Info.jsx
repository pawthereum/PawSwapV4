import { X } from 'react-feather';
import { useState } from 'react';

export const Info = () => {
  const [isHidden, setIsHidden] = useState(false);

  if (isHidden) return (<></>);

  return (
    <div className="rounded-xl shadow-xl mb-5 bg-gradient-to-r p-[6px] from-[#6EE7B7] via-[#3B82F6] to-[#9333EA]">
      <div className="relative w-full">
        <div className="top-2 right-2 absolute">
          <div className="btn btn-xs btn-ghost btn-circle" onClick={() => setIsHidden(true)}>
            <X className="w-5 h-5" />
          </div>
        </div>
      </div>
      <div className="flex h-full bg-base-100 rounded-lg p-4">
        <div className="grid grid-flow-row gap-2">
          <span className="text-lg text-center font-bold">PawSwap saves you from token fees and helps you donate your savings to charity.</span>
          <p>Projects are incentivized to list their tokens on PawSwap with less fees than other DEXs through PawSwaps Tax Structure Technology.</p>
          <p>PawSwap makes it easy for you to donate a portion of your swap to charity.</p>
        </div>
      </div>
  </div>
  )
}

export default Info;
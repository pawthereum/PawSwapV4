import { useState } from "react";
import { Copy } from "react-feather";

export const ConfirmListing = () => {
  const [acknowledged, setAcknowledged] = useState(false);

  const handleAcknowledgeChanged = (e) => {
    console.log({ e })
    setAcknowledged(e.target.checked)
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-start">
        <input checked={acknowledged} onChange={handleAcknowledgeChanged} type="checkbox" className="checkbox" />
        <span className="ml-2">Check this box once you have excluded PawSwap from taxes</span>
      </div>
      <div className="flex justify-center mt-2">
        <div className="form-control w-full">
          <label className="input-group">
            <input onChange={() => {}} value={'Pawswap address'} type="text" className="input w-full input-bordered" />
            <span className="cursor-pointer"><Copy className="h-5 w-5 mr-1" />Copy</span>
          </label>
        </div>
      </div>
    </div>
  )
}

export default ConfirmListing;
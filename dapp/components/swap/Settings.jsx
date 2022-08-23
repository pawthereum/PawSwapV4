import { useContext, useEffect, useState } from 'react';
import { Settings as SettingsIcon, X } from 'react-feather';
import NotificationContext from '../../context/NotificationContext';
import SwapContext from '../../context/SwapContext';

export const Settings = () => {
  const { slippage, updateSlippage } = useContext(SwapContext);
  const { popNotification } = useContext(NotificationContext);
  const [slippageInput, setSlippageInput] = useState(slippage);
  
  const handleSlippageChange = (e) => {
    if (isNaN(Number(e.target.value))) return;
    if (Number(e.target.value) > 50) {
      return popNotification({
        type: 'error',
        title: 'Maximum Slippage Exceeded',
        description: 'Slippage cannot exceed 50%'
      });
    }
    setSlippageInput(e.target.value);
  }

  useEffect(() => {
    updateSlippage(slippageInput);
  }, [slippageInput]);

  return (
    <div>
      <label htmlFor="settings-modal" className="btn btn-lg btn-ghost modal-button">
        <SettingsIcon className="h-5 w-5" />
      </label>
      <input type="checkbox" id="settings-modal" className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <div className="flex justify-between">
            <h3 className="font-bold text-lg">Set Slippage</h3>
            <label htmlFor="settings-modal" className="btn btn-sm btn-ghost btn-circle absolute top-4 right-4"><X/></label>
          </div>
          <label className="input-group justify-center">
            <input 
              type="text" 
              placeholder="Set Slippage"
              className="shadow-inner input bg-base-200 hover:bg-base-300 focus:outline-0 input-lg w-full" 
              value={slippage}
              onChange={handleSlippageChange}
            />
            <span className="shadow-inner bg-base-200">%</span>
          </label>
          <div className="modal-action">
            <label htmlFor="settings-modal" className="btn btn-secondary">Close</label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings;
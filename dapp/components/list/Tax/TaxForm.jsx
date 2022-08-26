import { useMemo, useState } from 'react';
import { Percent } from 'react-feather';

export const TaxForm = ({ tax }) => {
  const [name, setName] = useState('');
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [wallet, setWallet] = useState('');

  const handleNameChanged = (e) => {
    setName(e.target.value);
  }

  const handleBuyChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setBuy(e.target.value);
  }

  const handleSellChanged = (e) => {
    if (isNaN(Number(e.target.value))) return;
    setSell(e.target.value);
  }

  const displayBuy = useMemo(() => {
    return buy ? buy : '0';
  }, [buy]);

  const displaySell = useMemo(() => {
    return sell ? sell : '0';
  }, [sell]);

  return (
    <div className="collapse collapse-arrow rounded-md">
      <input type="checkbox" className="peer" /> 
      <div className="collapse-title peer-checked:bg-secondary peer-checked:text-secondary-content">
        <div className="flex items-center justify-between">
          <div className="grow md:flex items-center sm:grid sm:grid-flow-row">
            <div className="text-lg">Tax 1</div>
            <span className="badge badge-primary badge-sm sm:ml-2">
              unsaved changes
            </span> 
          </div>
          <div className="flex">
            <div className="badge badge-success mx-1">
              {displayBuy}%
            </div>
            <div className="badge badge-error mx-1">
              {displaySell}%
            </div>
          </div>
        </div>
      </div>
      <div className="collapse-content bg-primary text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content"> 
        <div className="form-control mt-4 text-neutral">
          <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
            <label className="input-group my-1 w-full">
              <span>Buy</span>
              <input value={buy} onChange={handleBuyChanged} type="text" placeholder="Buy Tax" className="input input-bordered w-full text-end" />
              <span className="bg-success"><Percent className="h-5 w-5"/></span>
            </label>
            <label className="input-group my-1">
              <span>Sell</span>
              <input value={sell} onChange={handleSellChanged} type="text" placeholder="Sell Tax" className="input input-bordered w-full text-end" />
              <span className="bg-error"><Percent className="h-5 w-5"/></span>
            </label>
          </div>
          <label className="input-group my-1 w-full">
            <span>Name</span>
            <input value={name} onChange={handleNameChanged} type="text" placeholder="Tax Name" className="input input-bordered w-full" />
          </label>
          <label className="input-group my-1">
            <span>Wallet</span>
            <input type="text" placeholder="0xA1b23C...D3e4" className="input input-bordered w-full" />
          </label>
          <button className="btn btn-block btn-primary mt-2">
            Update Tax
          </button>
        </div>
      </div>
    </div>
  )
}

export default TaxForm;
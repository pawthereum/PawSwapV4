import { useContext } from 'react';
import ListContext from '../../context/ListContext';
import shortenAddress from '../../helpers/shortenAddress';

export const Steps = () => {
  const { 
    step, 
    updateStep, 
    listToken,
    taxStructureContractAddress
  } = useContext(ListContext);
  return (
    <ul className="steps steps-vertical lg:steps-horizontal">
      <li 
        className={`cursor-pointer step ${step >= 0 ? 'step-primary' : ''}`}
        onClick={() => updateStep(0)}
      >
        { !listToken 
          ? 'Select Token'
          :
            <div className="grid grid-flow-row">
              <div>Select Token</div>
              <div className="text-xs tracking-widest uppercase text-base-content">
                {listToken?.token?.symbol}
              </div>
            </div>
        }
      </li>
      <li 
        className={`cursor-pointer step ${step >= 1 ? 'step-primary' : ''}`}
        onClick={() => updateStep(1)}
      >
        { !taxStructureContractAddress 
          ? 'Launch Contract' 
          : 
            <div className="grid grid-flow-row">
              <div>Launch Contract</div>
              <div className="text-xs tracking-widest uppercase text-base-content">
                {shortenAddress(taxStructureContractAddress)}
              </div>
            </div>
        }
      </li>
      <li 
        className={`cursor-pointer step ${step >= 2 ? 'step-primary' : ''}`}
        onClick={() => updateStep(2)}
      >
        Set Taxes
      </li>
      <li 
        className={`cursor-pointer step ${step === 3 ? 'step-primary' : ''}`}
        onClick={() => updateStep(3)}
      >
        List
      </li>
    </ul>
  )
}

export default Steps;
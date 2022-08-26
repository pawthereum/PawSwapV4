import { useState } from 'react';

const useList = () => {
  const [step, setStep] = useState(0);
  const [taxStructureContractAddress, setTaxStructureContractAddress] = useState(null);
  const [listToken, setListToken] = useState(null);

  const updateListToken = (token) => {
    setListToken(token);
  }

  const nextStep = () => {
    setStep(step + 1);
  }

  const updateStep = (updateTo) => {
    setStep(updateTo);
  }

  const updateTaxStructureContractAddress = (addr) => {
    setTaxStructureContractAddress(addr);
  }

  return {
    listToken,
    taxStructureContractAddress,
    step,
    nextStep,
    updateStep,
    updateListToken,
    updateTaxStructureContractAddress,
  }
}

export default useList;
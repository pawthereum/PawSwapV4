import { useEffect, useState } from 'react';
import { TAX_STRUCTURE_ABI, PAWSWAP, defaultChainId } from '../constants';
import { constants } from 'ethers';
import { useContractRead, useNetwork } from 'wagmi';

const useList = () => {
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId });
  const [step, setStep] = useState(0);
  const [taxStructureContractAddress, setTaxStructureContractAddress] = useState(null); // tax struct deployed by or pasted by user
  const [listedTaxStructureAddress, setListedTaxStructureAddress] = useState(null); // the tax struct for listed token (must be listed already)
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

  ////////////////////////////////////////
  // hooks for reading blockchain data //
  //////////////////////////////////////
  
  const { 
    data: taxStructureAddress, 
    refetch: refetchTaxStructureAddress,
    internal: { dataUpdatedAt: taxStructUpdated } 
  } = useContractRead({
    addressOrName: PAWSWAP[chain?.id]?.address,
    contractInterface: PAWSWAP[chain?.id]?.abi,
    functionName: 'tokenTaxContracts',
    args: [listToken?.token?.address],
    enabled: listToken !== null,
    watch: listToken !== null,
    cacheTime: 30000,
  });

  const { data: buyTaxes } = useContractRead({
    // default to the contract recently deployed or pasted
    // fall back to what is already listed if it exists
    addressOrName: taxStructureContractAddress || taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getBuyTaxAmounts',
    args: [constants?.AddressZero],
    watch: true,
    cacheTime: 30000,
  });

  const { data: sellTaxes } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getSellTaxAmounts',
    args: [constants?.AddressZero],
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: taxNames } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxNames',
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const { data: taxWallets } = useContractRead({
    addressOrName: taxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxWallets',
    enabled: taxStructureAddress !== undefined,
    watch: taxStructureAddress !== undefined,
    cacheTime: 30000,
  });

  const refetchListedTaxStructure = async () => {
    const refetched = await refetchTaxStructureAddress();
    console.log({ refetched });
    setListedTaxStructureAddress(refetched?.data);
  }

  useEffect(() => {
    console.log({ listToken })
    refetchListedTaxStructure();
  }, [listToken]);

  useEffect(() => {
    setListedTaxStructureAddress(taxStructureAddress);
  }, [taxStructUpdated]);

  useEffect(() => {
    if (connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
  }, [connectedChain]);

  return {
    buyTaxes,
    sellTaxes,
    taxNames,
    taxWallets,
    listToken,
    listedTaxStructureAddress,
    taxStructureContractAddress,
    step,
    nextStep,
    updateStep,
    updateListToken,
    updateTaxStructureContractAddress,
  }
}

export default useList;
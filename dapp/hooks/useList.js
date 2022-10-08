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
  const [buyTaxes, setBuyTaxes] = useState([]);
  const [sellTaxes, setSellTaxes] = useState([]);
  const [taxNames, setTaxNames] = useState([]);
  const [taxWallets, setTaxWallets] = useState([]);
  const [routerAddress, setRouterAddress] = useState('');

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
  });

  const { data: buyTaxData, refetch: refetchBuyTaxes } = useContractRead({
    // default to the contract recently deployed or pasted
    // fall back to what is already listed if it exists
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getBuyTaxAmounts',
    args: [constants?.AddressZero],
  });

  const { data: sellTaxData, refetch: refetchSellTaxes } = useContractRead({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getSellTaxAmounts',
    args: [constants?.AddressZero],
  });

  const { data: taxNameData, refetch: refetchTaxNames } = useContractRead({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxNames',
  });

  const { data: taxWalletData, refetch: refetchTaxWallets } = useContractRead({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'getTaxWallets',
  });

  const { data: routerAddressData, refetch: refetchRouterAddress } = useContractRead({
    addressOrName: taxStructureContractAddress || listedTaxStructureAddress,
    contractInterface: TAX_STRUCTURE_ABI,
    functionName: 'routerAddress',
  });

  const refetchListedTaxStructure = async () => {
    const refetched = await refetchTaxStructureAddress();
    setListedTaxStructureAddress(refetched?.data);
  }

  useEffect(() => {
    refetchListedTaxStructure();
  }, [listToken]);

  useEffect(() => {
    setBuyTaxes(buyTaxData);
  }, [buyTaxData]);

  useEffect(() => {
    setSellTaxes(sellTaxData);
  }, [sellTaxData]);

  useEffect(() => {
    setTaxNames(taxNameData);
  }, [taxNameData]);

  useEffect(() => {
    setTaxWallets(taxWalletData);
  }, [taxWalletData]);

  useEffect(() => {
    setRouterAddress(routerAddressData);
  }, [routerAddressData]);

  const refetchTaxInfo = async () => {
    const [
      newBuyTaxes, 
      newSellTaxes, 
      newTaxWallets,
      newTaxNames,
      newRouterAddress,
    ] = await Promise.all([
      refetchBuyTaxes(),
      refetchSellTaxes(),
      refetchTaxWallets(),
      refetchTaxNames(),
      refetchRouterAddress()
    ]);
    setBuyTaxes(newBuyTaxes?.data);
    setSellTaxes(newSellTaxes?.data);
    setTaxWallets(newTaxWallets?.data);
    setTaxNames(newTaxNames?.data);
    setRouterAddress(newRouterAddress?.data);
  }

  useEffect(() => {
    setListedTaxStructureAddress(taxStructureAddress);
    refetchTaxInfo();
  }, [taxStructUpdated]);

  useEffect(() => {
    if (connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId });
    }
    (async () => {
      await refetchTaxStructureAddress();
      await refetchListedTaxStructure();
    })();
  }, [connectedChain]);

  return {
    buyTaxes,
    sellTaxes,
    taxNames,
    taxWallets,
    routerAddress,
    listToken,
    listedTaxStructureAddress,
    taxStructureContractAddress,
    step,
    refetchListedTaxStructure,
    refetchTaxInfo,
    nextStep,
    updateStep,
    updateListToken,
    updateTaxStructureContractAddress,
  }
}

export default useList;
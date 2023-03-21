import { useState, useEffect } from "react";

const usePrice = (token) => {
  const API = 'https://api.binance.com/api/v3/avgPrice?symbol=';
  const [price, setPrice] = useState(0);
  
  useEffect(() => {
    if (!token) return;
    const fetchPrice = async () => {
      try {
        const response = await fetch(API + (token || 'BNB') + 'USDT');
        const json = await response.json();
        setPrice(json.price);
      } catch (e) {
        console.log(e);
        setPrice(0);
      }
    }
    fetchPrice()
  }, [token]);
  
  return { price }
}

export default usePrice;
import { useMoralisCloudFunction } from "react-moralis";
import { useState, useEffect, useMemo } from "react";
import { useNetwork } from "wagmi";
import { defaultChainId } from "../constants";
import { utils } from "ethers";

const Leaderboard = () => {
  const { chain: connectedChain } = useNetwork();
  const [chain, setChain] = useState({ id: defaultChainId, nativeCurrency: { symbol: 'BNB' } });
  const [activeTab, setActiveTab] = useState('all');

  const [buyDonations, setBuyDonations] = useState([]);
  const [sellDonations, setSellDonations] = useState([]);

  const [buyLeaderboard, setBuyLeaderboard] = useState([]);
  const [sellLeaderboard, setSellLeaderboard] = useState([]);
  const [combinedLeaderboard, setCombinedLeaderboard] = useState([]);

  const activeLeaderboard = useMemo(() => {
    if (activeTab === 'buy') {
      return buyLeaderboard;
    }
    if (activeTab === 'sell') {
      return sellLeaderboard;
    }
    return combinedLeaderboard;
  }, [activeTab, buyLeaderboard, sellLeaderboard, combinedLeaderboard]);

  const COINGECKO_API_ENDPOINT = useMemo(() => {
    if (chain?.id === 1) {
      return `https://api.coingecko.com/api/v3/coins/ethereum/contract/`
    }
    return `https://api.coingecko.com/api/v3/coins/binance-smart-chain/contract/`
  }, [chain]);

  useEffect(() => {
    if (connectedChain) {
      setChain(connectedChain);
    } else {
      setChain({ id: defaultChainId, nativeCurrency: { symbol: 'BNB' } });
    }
  }, [connectedChain]);

  const { fetch: getLeaderboard } = useMoralisCloudFunction(
    "leaderboard",
    { chainId: chain?.id },
    { autoFetch: false }
  );

  const cloudCall = async () => {
    getLeaderboard({
      onSuccess: async (data) => {
        setBuyDonations(data[0]);
        setSellDonations(data[1]);
      },
    });
  };

  useEffect(() => {
    cloudCall();
  }, [chain, getLeaderboard]);

  const mapDonations = async (donations, stateSetter) => {
    const tokens = await Promise.all(donations?.map(async (t) => {
      try {
        const cgData = await fetch(COINGECKO_API_ENDPOINT + t.objectId);
        const cgJson = await cgData.json();
        return {
          ethDonated: t.ethDonated,
          token: cgJson
        }
      } catch (e) {
        return e
      }
    }));
    stateSetter(tokens);
  }

  useEffect(() => {
    if (!buyDonations.length) return;
    mapDonations(buyDonations, setBuyLeaderboard);
  }, [buyDonations]);

  useEffect(() => {
    if (!sellDonations.length) return;
    mapDonations(sellDonations, setSellLeaderboard);
  }, [sellDonations]);

  useEffect(() => {
    if (buyLeaderboard.length && !sellLeaderboard.length) {
      setCombinedLeaderboard(buyLeaderboard);
      return;
    } else if (!buyLeaderboard.length && sellLeaderboard.length) {
      setCombinedLeaderboard(sellLeaderboard);
      return;
    }
    // combine the buyLeaderboard and sellLeaderboard but aggregate the ethDonated when the tokens are the same
    const combined = buyLeaderboard.map((b) => {
      const s = sellLeaderboard.find((s) => s.token.id === b.token.id);
      if (s) {
        return {
          ethDonated: utils.formatEther(utils.parseEther(b.ethDonated).add(utils.parseEther(s.ethDonated))),
          token: b.token
        }
      }
      return b;
    });
    setCombinedLeaderboard(combined);
  }, [buyLeaderboard, sellLeaderboard]);

  return (
    <div className="mx-2">
      <div className="max-w-3xl mx-auto">
        <div className="my-8">
          <div className="text-4xl text-center">Leaderboard</div>
          <p className="text-center max-w-sm mx-auto mt-2 text-sm">
            Which token communities on PawSwap are donating the most to charitable causes?
          </p>
        </div>
      </div>
      <div className="flex justify-center w-full mb-4">
        <div className="tabs tabs-boxed">
          <a 
            className={`tab ${activeTab === 'all' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Swaps
          </a> 
          <a
            className={`tab ${activeTab === 'buy' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('buy')}
          >
            Buys
          </a> 
          <a
            className={`tab ${activeTab === 'sell' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            Sells
          </a>
        </div>
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="overflow-x-auto w-full shadow-2xl rounded-xl">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Token</th>
                <th>Amount Donated ({chain?.nativeCurrency?.symbol})</th>
              </tr>
            </thead>
            <tbody>
              {activeLeaderboard.map((leader) => (
                <tr key={leader?.token?.id}>
                  <td>
                    <div className="flex items-center space-x-3">
                      <div className="avatar">
                        <div className="mask mask-squircle w-12 h-12">
                          <img src={leader?.token?.image?.large} alt={leader?.token?.name} />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{leader?.token?.name}</div>
                        <div className="text-sm opacity-50 uppercase">{leader?.token?.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {utils.formatEther(leader.ethDonated, { commify: true })}
                    &nbsp;
                    {chain?.nativeCurrency?.symbol}
                  </td>
                </tr>
              ))}
            </tbody>
            
          </table>
        </div>
      </div>
    </div>
  )
}

export default Leaderboard;
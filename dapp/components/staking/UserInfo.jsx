import CountUp from 'react-countup';
import { utils } from 'ethers';
import { PAWTH_DECIMALS } from '../../constants';

const UserInfo = ({ tokenBalance, nativeBalance, stakedBalance, chain }) => {
  return (
    <div className="grid grid-row-2 gap-2">
      <div className="flex justify-between">
        <div>
          <div className="text-left">
            {chain?.nativeCurrency?.symbol} Balance
          </div>
          <div className="text-left font-bold text-lg">
            <CountUp end={utils.formatEther(nativeBalance?.toString() || '0')} decimals={4} separator="," />
          </div>
        </div>
        <div>
          <div className="text-right">
            $PAWTH Balance
          </div>
          <div className="text-right font-bold text-lg">
            <CountUp end={utils.formatUnits(tokenBalance?.toString() || '0', PAWTH_DECIMALS)} decimals={0} separator="," />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <div className="text-left">
            Currently Staking
          </div>
          <div className="text-left font-bold text-lg">
            <CountUp end={utils.formatEther(stakedBalance?.toString() || '0')} decimals={0} separator="," />
          </div>
        </div>
        <div>
          <div className="text-right">
            Staking Profit
          </div>
          <div className="text-right font-bold text-lg">
            <CountUp end={5256} decimals={0} separator="," />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInfo;
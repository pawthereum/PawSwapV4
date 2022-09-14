import CountUp from 'react-countup';
import { utils } from 'ethers';
import { PAWTH_DECIMALS } from '../../constants';

const UserInfo = ({ 
  tokenBalance, 
  nativeBalance, 
  stakedBalance, 
  rewardBalance,
  prevRewardBalance,
  reflectionBalance,
  prevReflectionBalance,
  chain 
}) => {
  return (
    <div className="grid grid-row-2 gap-2">
      <div className="flex justify-between">
        <div>
          <div className="text-left">
            Currently Staking
          </div>
          <div className="text-left font-bold text-lg">
            <CountUp 
              end={utils.formatUnits(stakedBalance?.toString() || '0', PAWTH_DECIMALS)} 
              decimals={0} 
              separator="," 
            />
          </div>
        </div>
        <div>
          <div className="text-right">
            $PAWTH Balance
          </div>
          <div className="text-right font-bold text-lg">
            <CountUp 
              end={utils.formatUnits(tokenBalance?.toString() || '0', PAWTH_DECIMALS)} 
              decimals={0} 
              separator="," 
            />
          </div>
        </div>
      </div>
      <div className="flex justify-between">
        <div>
          <div className="text-left">
            Reflections Earned
          </div>
          <div className="text-left font-bold text-lg">
            <CountUp 
              start={utils.formatUnits(prevReflectionBalance?.toString() || '0', PAWTH_DECIMALS)}
              end={utils.formatUnits(reflectionBalance?.toString() || '0', PAWTH_DECIMALS)} 
              decimals={0} 
              separator="," 
            />
          </div>
        </div>
        <div>
          <div className="text-right">
            Staking Profit
          </div>
          <div className="text-right font-bold text-lg">
            <CountUp 
              start={utils.formatUnits(prevRewardBalance?.toString() || '0', PAWTH_DECIMALS)}
              end={utils.formatUnits(rewardBalance?.toString() || '0', PAWTH_DECIMALS)} 
              decimals={0} 
              separator="," 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserInfo;
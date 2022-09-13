import Image from 'next/image';
import StakingControls from "../components/StakingControls";
import logo from '../public/img/logo-horizontal.svg';

const Staking = () => {
  return (
    <main className="flex justify-center">
      <div className="max-w-xl">
        <div className="min-w-full">
          <div className="sm:mx-0 mx-2">
            <div className="text-center mt-12">
              <div className="mb-4">
                <Image
                  src={logo}
                  height={75}
                  width={350}
                />
              </div>
              <div className="card w-full max-w-xl bg-base-100 shadow-xl sm:px-20 sm:py-10 p-10">
                <h1 className="text-6xl font-bold text-secondary">Stake</h1>
                <div className="text-xl my-4">Stake your $PAWTH to earn rewards!</div>
                <StakingControls />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Staking;
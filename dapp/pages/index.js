import Image from 'next/image';
import Link from 'next/link';
import supercat from '../public/img/supercat.svg';
import pawthLogo from '../public/img/pawthereum.svg';
import { TrendingUp, Heart, DollarSign, BarChart, Droplet, Zap } from 'react-feather';

const Landing = () => {
  return (
    <div>
      <div className="w-full max-w-7xl mx-auto">
        <div className="w-full xl:rounded-xl xl:shadow-xl dark:bg-hero-dark bg-hero bg-cover bg-no-repeat px-10 sm:px-20 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center">
              <div className="grid grid-flow-row gap-2">
                <span className="text-5xl font-bold">PawSwap</span>
                <div>
                  The first ever Charitable DEX by <a className="font-bold" href="https://pawthereum.com" target="_blank" rel="noreferrer">Pawthereum</a>
                </div>
                <div className="flex items-center">
                  <Link href="/swap">
                    <button className="btn btn-primary mr-4">Launch App</button>
                  </Link>
                  <Link href="/list">
                    <div className="indicator">
                      <span className="indicator-item badge badge-accent">free</span> 
                      <button className="btn btn-secondary">List My Token</button>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mx-auto">
              <Image src={supercat} alt="Supercat" width={400} height={400} />
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 my-20 px-5">
          <div className="mx-auto text-center">
            <span className="flex justify-center"><BarChart className="text-primary h-12 w-12 mb-2"  /></span>
            <span className="flex justify-center text-lg font-bold">
              Good for Projects
            </span>
            <span>PawSwap accumulates token taxes in the blockchain&apos;s native token which reduces a project&apos;s sell pressure</span>
          </div>
          <div className="mx-auto text-center">
            <span className="flex justify-center"><DollarSign className="text-primary h-12 w-12 mb-2"  /></span>
            <span className="flex justify-center text-lg font-bold">Good for Users</span>
            <span>Projects attracts users to PawSwap by offering lower tax rates so that the project can minimize sell pressure on their charts</span>
          </div>
          <div className="mx-auto text-center">
            <span className="flex justify-center"><Heart className="text-primary h-12 w-12 mb-2"  /></span>
            <span className="flex justify-center text-lg font-bold">Good for Charities</span>
            <span>PawSwap makes it easy for users to donate their tax rate savings to thousands of charities and causes that matter to them</span>
          </div>
        </div>
        <div className="w-full xl:rounded-xl xl:shadow-xl bg-gradient-radial from-base-100 to-secondary text-secondary-content bg-cover bg-no-repeat px-10 sm:px-20 py-10 mb-10">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-4 my-10 px-5">
            <div className="m-auto">
              <Image src={pawthLogo} alt="Supercat" width={200} height={200} />
            </div>
            <div className="m-auto">
              <span className="flex justify-center text-2xl font-bold">Built by Pawthereum</span>
              <p className="xl:text-start text-center">Pawthereum is decentralized, community-run charity cryptocurrency project that gives back to animal shelters and advocates for the well-being of animals in need!</p>
              <div className="flex justify-center">
                <a href="https://pawthereum.com" target="_blank" rel="noreferrer">
                  <button className="btn btn-primary btn-sm mt-2">Learn More</button>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-rows-2 gap-2 justify-center mt-20 mb-10">
          <div className="text-2xl font-bold px-5 text-center">List your token on PawSwap for free!</div>
            <div className="w-full flex justify-center">
              <Link href="/list">
                <button className="btn btn-secondary">List My Token</button>
              </Link>
            </div>
        </div>
        <div className="grid lg:grid-cols-3 grid-cols-1 gap-4 mb-10 px-5">
          <div className="mx-auto text-center">
            <span className="flex justify-center"><TrendingUp className="text-primary h-12 w-12 mb-2"  /></span>
            <span className="flex justify-center text-lg font-bold">
              Take Token Taxes in BNB or ETH
            </span>
            <span>PawSwap accumulates token taxes in the blockchain&apos;s native token so you do not need to sell your token on your chart!</span>
          </div>
          <div className="mx-auto text-center">
            <span className="flex justify-center"><Droplet className="text-primary h-12 w-12 mb-2"  /></span>
            <span className="flex justify-center text-lg font-bold">
              No Additional Liquidity Required
            </span>
            <span>PawSwap works with your existing BNB or ETH liquidity pool! No need to come up with a massive amount of tokens in order to list on PawSwap</span>
          </div>
          <div className="mx-auto text-center">
            <span className="flex justify-center"><Zap className="text-primary h-12 w-12 mb-2"  /></span>
            <div className="w-full">
              <div className="flex justify-center text-lg font-bold">
                <div className="indicator">
                  <span className="indicator-item indicator-middle badge badge-accent">Soon</span> 
                  <div className="pr-8">Trend by Giving</div>
                </div>
              </div>
            </div>
            <span>Trending tokens on PawSwap are determined by how much your community gives to charitable causes on the platform!</span>
          </div>
        </div>
      </div>

      <footer className="p-10 pt-20 mt-40 bg-secondary text-secondary-content w-full">
        <div className="footer max-w-7xl mx-auto">
          <div>
            <span className="footer-title">Social</span> 
            <a className="link link-hover" href="https://twitter.com/pawthereum" target="_blank" rel="noreferrer">Twitter</a>
            <a className="link link-hover" href="https://t.me/pawthereum" target="_blank" rel="noreferrer">Telegram</a>
            <a className="link link-hover" href="https://discord.gg/pawthereum" target="_blank" rel="noreferrer">Discord</a>
            <a className="link link-hover" href="https://reddit.com/r/pawthereum" target="_blank" rel="noreferrer">Reddit</a>
          </div> 
          <div>
            <span className="footer-title">Pawthereum</span> 
            <a className="link link-hover" href="mailto:contact@pawthereum.com" target="_blank" rel="noreferrer">Contact</a>
            <a className="link link-hover" href="https://dao.pawthereum.com/" target="_blank" rel="noreferrer">DAO</a>
            <a className="link link-hover" href="https://pawthereum.com/">Website</a>
            <a>
              Pawthereum LLC 30 N Gould St Ste R <br/>
              Sheridan, WY 82801
            </a>
          </div> 
          <div>
            <span className="footer-title">Pawthereum Charity</span> 
            <a className="link link-hover" href="mailto:charity@pawthereum.com" target="_blank" rel="noreferrer">Charity Outreach</a>
            <a className="link link-hover" href="https://pawthereum.com/charity-donations" target="_blank" rel="noreferrer">Donations</a>
            <a className="link link-hover" href="https://vote.pawthereum.com/">Vote</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
// Context
import NotificationContext from '../context/NotificationContext';
import SwapContext from '../context/SwapContext';
// Components
import Notification from '../components/utils/Notification';
import { Swap } from '../components/swap/Swap';
// Hooks
import useNotification from '../hooks/useNotification';
import useSwap from '../hooks/useSwap';

export default function Home() {
  const notification = useNotification();
  const notificationState = {
    ...notification
  }

  const swap = useSwap();
  const swapState = {
    ...swap
  }

  return (
    <div>
      <Head>
        <title>PawSwap | Swap</title>
        <meta name="description" content="A decentralized exchange by Pawthereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="app-container flex justify-center">
          <div className="max-w-lg">
            <SwapContext.Provider value={swapState}>
              <NotificationContext.Provider value={notificationState}>
                <Notification />
                <div className="grid grid-flow-row gap-2">
                  <div className="flex justify-center">
                    <Swap />
                  </div>
                </div>
              </NotificationContext.Provider>
            </SwapContext.Provider>
          </div>
        </div>
      </main>

      <footer className="flex justify-center mt-10 mb-5">
        <a
          href="https://pawthereum.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex flex-col gap-2 items-center">
            <div className="flex items-center">
              <div className="mr-1">Learn more about</div>
              <div className="pt-2">
                <Image src="/img/pawth-horizontal.svg" className="filter-primary" alt="Pawthereum Logo" width={132} height={20} />
              </div>
            </div>
            <div>
              <Script
                src={`const BADGE_ID = ${process.env.NEXT_PUBLIC_ALCHEMY_BADGE_ID}`}
                strategy="beforeInteractive"
              />
              <Script
                src="https://static.alchemyapi.io/scripts/badge/alchemy-badge.js"
                strategy="beforeInteractive"
              />
              <a href="#">
                <img onclick={() => window?.logBadgeClick() || {}} id="badge-button" style={{ width: "240px", height: "53px" }} src="https://static.alchemyapi.io/images/marketing/badgeLight.png" alt="Alchemy Supercharged" />
              </a>
            </div>
          </div>
        </a>
      </footer>
    </div>
  )
}

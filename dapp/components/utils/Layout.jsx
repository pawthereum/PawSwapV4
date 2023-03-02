import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
// components
import MenuTop from './MenuTop';
import logo from '../../public/img/pawth-horizontal.svg';
import { useMemo } from 'react';

export default function Layout({children}) {
  const router = useRouter();
  const pathname = router.pathname;

  const isEmbedded = useMemo(() => {
    return pathname === '/embed';
  }, [pathname]);

  const noBg = useMemo(() => {
    return isEmbedded;
  }, [isEmbedded]);

  const hideMenuTop = useMemo(() => {
    return isEmbedded;
  }, [isEmbedded]);

  return (
    <>
      <div className="drawer">
        <input id="nav-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className={`h-full min-h-screen relative flex flex-col ${ noBg ? 'bg-transparent' : 'app-bg'}`}>
            <div className="h-full grow flex flex-col">
              { hideMenuTop || process.env.NEXT_PUBLIC_MAINTENANCE_MODE === '1' ? <></> : <MenuTop />}
              <div className="z-10">
                {children}
              </div>
            </div>
          </div>
        </div> 
        <div className="drawer-side">
          <label htmlFor="nav-drawer" className="drawer-overlay"></label>
          <ul className="menu p-4 overflow-y-auto w-80 bg-base-100 text-base-content">
            <div className="my-8 w-full justify-center flex">
              <Image src={logo} className="filter-primary" alt="Pawthereum Logo" width={125} height={19} />
            </div>
            <Link href="/swap">
              <li>
                <a 
                  onClick={() => document.getElementById('nav-drawer').click()}
                  className={`btn btn-ghost normal-case text-lg ${router?.pathname === '/swap' ? 'text-primary-content bg-primary' : ''}`}
                >
                  Swap
                </a>
              </li>
            </Link>
            <Link href="/list">
              <li>
                <a 
                  onClick={() => document.getElementById('nav-drawer').click()}
                  className={`btn btn-ghost normal-case text-lg ${router?.pathname === '/list' ? 'text-primary-content bg-primary' : ''}`}
                >
                  List
                </a>
              </li>
            </Link>
          </ul>
        </div>
      </div>
    </>
  );
}
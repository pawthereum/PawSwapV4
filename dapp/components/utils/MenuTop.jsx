import Link from 'next/link';
import { useRouter } from 'next/router';
import { Menu } from 'react-feather';
// Components
import Connect from './Connect';

export default function MenuTop() {
  const router = useRouter();

  return (
    <div className="navbar max-w-3xl mx-auto mt-2">
      <div className="flex justify-between w-full">
        <label htmlFor="nav-drawer" className="btn btn-ghost drawer-button sm:hidden flex">
          <Menu className="h-5 w-5" />
        </label>
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">
            Pawthereum
          </a>
        </Link>
      </div>
      <div className="mr-2 hidden sm:flex">
        <Link href="/list">
          <a 
            className={`btn btn-ghost normal-case text-lg ${router?.pathname === '/list' ? 'text-primary-content bg-primary' : ''}`}
          >
            List
          </a>
        </Link>
      </div> 
      <div className="flex-none">
        <Connect />
      </div>
    </div>
  );
}
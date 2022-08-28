import Link from 'next/link';
import { useRouter } from 'next/router'
// Components
import Connect from './Connect';

export default function MenuTop() {
  const router = useRouter();
  return (
    <div className="navbar max-w-3xl mx-auto mt-2">
      <div className="flex-1">
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">
            Pawthereum
          </a>
        </Link>
      </div>
      <div className="mr-2">
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
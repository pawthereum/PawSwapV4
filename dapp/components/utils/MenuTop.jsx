import Link from 'next/link';
// Components
import Connect from './Connect';

export default function MenuTop() {
  return (
    <div className="navbar max-w-3xl mx-auto mt-2">
      <div className="flex-1">
        <Link href="/">
          <a className="btn btn-ghost normal-case text-xl">
            Pawthereum
          </a>
        </Link>
      </div>
      <div className="flex-none">
        <Connect />
      </div>
    </div>
  );
}
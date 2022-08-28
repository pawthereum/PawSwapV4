import Head from 'next/head';
import Image from 'next/image';
// Context
import NotificationContext from '../context/NotificationContext';
import ListContext from '../context/ListContext';
// Components
import Notification from '../components/utils/Notification';
import { List } from '../components/list/List';
// Hooks
import useNotification from '../hooks/useNotification';
import useList from '../hooks/useList';

export default function ListPage() {
  const notification = useNotification();
  const notificationState = {
    ...notification
  }

  const list = useList();
  const listState = {
    ...list
  }

  return (
    <div>
      <Head>
        <title>PawSwap | List</title>
        <meta name="description" content="List on PawSwap, a decentralized exchange by Pawthereum" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="app-container flex justify-center">
          <ListContext.Provider value={listState}>
            <NotificationContext.Provider value={notificationState}>
              <Notification />
              <List />
            </NotificationContext.Provider>
          </ListContext.Provider>
        </div>
      </main>

      <footer className="flex justify-center mt-10 mb-5">
        <a
          href="https://pawthereum.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center">
            <div className="mr-1">Learn more about</div>
            <div className="pt-2">
              <Image src="/img/pawth-horizontal.svg" className="filter-primary" alt="Pawthereum Logo" width={132} height={20} />
            </div>
          </div>
        </a>
      </footer>
    </div>
  )
}
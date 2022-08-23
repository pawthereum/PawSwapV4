import { useContext } from 'react';
// Components
import { X } from 'react-feather';
// Context
import NotificationContext from '../../context/NotificationContext';

const Notification = () => {
  const { dismissNotification, showNotification, notification } = useContext(NotificationContext);

  const notificationIcon = () => {
    switch (notification?.type) {
      case 'error': return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      default: return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  }

  const goToLink = () => {
    if (!notification.link) return;
    window.open(
      notification.link,
      '_blank' // open in a new window.
    );
  }

  const trimDescription = (desc) => {
    if (!desc) return '';
    if (desc.length < 100) return desc;
    return desc;
    // return desc.slice(0, 100) + '...'
  }

  if (!showNotification) return (<></>);

  return (
    <div
      style={{ zIndex: 9999 }} 
      className={`top-2 right-2 absolute max-w-sm border-2 bg-base-100 mr-2 mt-2 shadow-xl sm:mr-10 sm:mt-10 rounded-xl p-5 ${notification?.type === 'error' ? 'border-error' : 'border-success'}`}
    >
      <div className="ml-2 mr-6 cursor-pointer break-words" onClick={() => goToLink()}>
        <span className="font-semibold">
          <div className="flex items-start"> 
            <span className="mr-2">{ notificationIcon() }</span>
            <span className="font-bold">{notification?.title}</span>
          </div>
        </span>
        <span className="block mt-2">{trimDescription(notification?.description)}</span>
      </div>
      <div className="cursor-pointer flex absolute items-center top-4 right-4" onClick={() => dismissNotification()}>
        <X className="h-5 w-5" />
      </div>
    </div>
  )
}

export default Notification;
import { useState } from 'react';

const useNotification = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [notification, setNotification] = useState({
    title: '',
    description: '',
    duration: 0,
    type: 'success', // 'warning', 'info', 'error'
    link: 'https://bscscan.com', // optional link
  });
  const NOTIFICATION_DURATION_MS = 6000; // close after 6s

  const dismissNotification = () => {
    setShowNotification(false);
  }

  const popNotification = (noti) => {
    setNotification(noti);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, noti.duration || NOTIFICATION_DURATION_MS);
  }

  return {
    dismissNotification,
    notification,
    popNotification,
    showNotification,
  }
}

export default useNotification;
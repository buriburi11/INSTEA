import { useEffect, useState } from 'react'
import { initialMemberNotifications } from '../data/memberNotifications.js'
import { NotificationContext } from './NotificationContext.js'

const NOTIFICATION_STORAGE_KEY = 'instea.mockNotifications'

function readStoredNotifications() {
  try {
    const storedNotifications = localStorage.getItem(
      NOTIFICATION_STORAGE_KEY,
    )

    if (storedNotifications) {
      return JSON.parse(storedNotifications)
    }
  } catch {
    // Use the original mock notifications when stored data is invalid.
  }

  return structuredClone(initialMemberNotifications)
}

export default function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(
    readStoredNotifications,
  )

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify(notifications),
    )
  }, [notifications])

  function markAsRead(notificationId) {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification,
      ),
    )
  }

  function markAllAsRead() {
    setNotifications((currentNotifications) =>
      currentNotifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    )
  }

  function resetNotifications() {
    setNotifications(structuredClone(initialMemberNotifications))
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead,
  ).length

    const contextValue = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    resetNotifications,
    }

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}
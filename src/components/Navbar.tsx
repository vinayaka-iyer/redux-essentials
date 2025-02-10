import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { selectCurrentUser } from '@/features/users/usersSlice'
import React from 'react'
import { Link } from 'react-router-dom'
import { UserIcon } from './UserIcon'
import {
  fetchNotificationsWebsocket,
  selectUnreadNotificationsCount,
  useGetNotificationsQuery,
} from '@/features/notifications/notificationsSlice'

export const Navbar = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector(selectCurrentUser)

  // trigger initial fetch and keep websocket open
  useGetNotificationsQuery()

  const numUnreadNotifications = useAppSelector(selectUnreadNotificationsCount)

  const isLoggedIn = !!user

  let navContent: React.ReactNode = null

  let unreadNotificationsBadge: React.ReactNode | undefined

  if (numUnreadNotifications > 0) {
    unreadNotificationsBadge = <span className="badge">{numUnreadNotifications}</span>
  }

  if (isLoggedIn) {
    const onLogoutClicked = () => {
      dispatch(logout())
    }

    const fetchNewNotifications = () => {
      dispatch(fetchNotificationsWebsocket())
    }

    navContent = (
      <div className="navContent">
        <div className="navLinks">
          <Link to="/posts">Posts</Link>
          <Link to="/users">Users</Link>
          <Link to="/notifications">Notifications {unreadNotificationsBadge}</Link>
          <button className="button small" onClick={fetchNewNotifications}>
            Refresh Notifications
          </button>
        </div>
        <div className="userDetails">
          <UserIcon size={32} />
          {user.name}
          <button className="button small" onClick={onLogoutClicked}>
            Log Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <nav>
      <section>
        <h1>Tweeter using Redux</h1>
        {navContent}
      </section>
    </nav>
  )
}

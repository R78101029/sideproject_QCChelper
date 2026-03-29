'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Notification {
  id: string
  title: string
  content: string | null
  isRead: boolean
  linkUrl: string | null
  createdAt: string
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((res) => {
        if (res.success) {
          setNotifications(res.data)
          setUnreadCount(res.unreadCount)
        }
      })
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setUnreadCount(0)
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open && unreadCount > 0) markAllRead() }}
        className="relative rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 px-4 py-2">
            <span className="text-sm font-medium text-gray-900">通知</span>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">暫無通知</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className={`border-b border-gray-100 px-4 py-2.5 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                  {n.linkUrl ? (
                    <Link href={n.linkUrl} onClick={() => setOpen(false)} className="block">
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      {n.content && <p className="mt-0.5 text-xs text-gray-500">{n.content}</p>}
                    </Link>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-800">{n.title}</p>
                      {n.content && <p className="mt-0.5 text-xs text-gray-500">{n.content}</p>}
                    </>
                  )}
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {new Date(n.createdAt).toLocaleDateString('zh-TW')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

"use client";
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useClientSession } from './ClientSessionProvider';

export function NotificationsBell() {
  const { unreadCount } = useClientSession();
  return (
    <Link href="/notifications" className="relative inline-flex items-center justify-center">
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-emerald-600 text-white text-[10px] leading-4 text-center px-1">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

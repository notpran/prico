"use client";
import { useClientSession } from '../../components/ClientSessionProvider';

export default function NotificationsPage() {
  const { notifications, markAllRead } = useClientSession();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
        <button onClick={markAllRead} className="text-sm underline hover:no-underline">Mark all read</button>
      </div>
      {notifications.length === 0 ? (
        <p className="text-muted-foreground">No notifications yet.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className={`border rounded p-3 ${n.read ? 'opacity-70' : ''}`}>
              <div className="font-medium">{n.title}</div>
              {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
              <div className="text-xs text-muted-foreground mt-1">{new Date(n.ts).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

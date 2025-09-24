import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default async function MessagesPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const convos = await api.messages.listConversations();
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Direct Messages</h1>
      <ul className="space-y-2">
        {convos.map((c: any) => {
          const other = c.participant_ids.find((id: string) => id !== user.id) || 'You';
          // Placeholder unread (no read_markers returned in current API list): treat all as read for now
          const unread = 0; // would compute via c.read_markers[user.id]
          return (
            <li key={c._id} className="border rounded p-2 flex justify-between items-center">
              <span className="text-sm flex items-center gap-2">
                {other}
                {unread > 0 && <span className="text-[10px] rounded bg-primary text-primary-foreground px-1 py-0.5">{unread}</span>}
              </span>
              <Link className="text-xs underline" href={`/messages/dm/${other}`}>Open</Link>
            </li>
          );
        })}
        {convos.length === 0 && <li className="text-sm text-muted-foreground">No conversations yet.</li>}
      </ul>
    </div>
  );
}

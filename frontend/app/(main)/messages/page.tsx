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
        {convos.map((c: any) => (
          <li key={c._id} className="border rounded p-2 flex justify-between items-center">
            <span className="text-sm">{c.participant_ids.filter((id: string) => id !== user.id).join(', ') || 'You'}</span>
            <Link className="text-xs underline" href={`/messages/dm/${c.participant_ids.find((id: string) => id !== user.id)}`}>Open</Link>
          </li>
        ))}
        {convos.length === 0 && <li className="text-sm text-muted-foreground">No conversations yet.</li>}
      </ul>
    </div>
  );
}

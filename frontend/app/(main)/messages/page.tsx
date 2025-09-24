import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';

export default async function MessagesPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  const convos = await api.messages.listConversations();
  const allIds = Array.from(new Set((convos as any[]).flatMap((c: any) => c.participant_ids as string[])))
    .filter((id: any) => typeof id === 'string' && id !== user.id) as string[];
  let userMap: Record<string, any> = {};
  if (allIds.length) {
  const details = await api.users.bulkByClerk(allIds as string[]);
    userMap = Object.fromEntries(details.map((u: any) => [u.clerk_id, u]));
  }
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Direct Messages</h1>
      <ul className="space-y-2">
        {convos.map((c: any) => {
          const otherId = c.participant_ids.find((id: string) => id !== user.id) || user.id;
            const otherUser = userMap[otherId];
            const label = otherUser?.username || otherUser?.full_name || otherId || 'You';
            const unread = c.unread || 0;
            const lastSnippet = c.last_message?.content ? (c.last_message.content.length > 40 ? c.last_message.content.slice(0,40) + '…' : c.last_message.content) : '';
            return (
              <li key={c._id} className="border rounded p-2 flex justify-between items-center">
                <div className="flex flex-col flex-1 mr-2">
                  <span className="text-sm flex items-center gap-2">
                    {label}
                    {unread > 0 && <span className="text-[10px] rounded bg-primary text-primary-foreground px-1 py-0.5">{unread}</span>}
                  </span>
                  {lastSnippet && <span className="text-[10px] text-muted-foreground truncate">{lastSnippet}</span>}
                </div>
                <Link className="text-xs underline" href={`/messages/dm/${otherId}`}>Open</Link>
              </li>
            );
          })}
        {convos.length === 0 && <li className="text-sm text-muted-foreground">No conversations yet.</li>}
      </ul>
    </div>
  );
}

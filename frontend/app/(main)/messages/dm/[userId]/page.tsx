import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import DmClient from './realtime';

export default async function DmPage({ params }: { params: { userId: string } }) {
  const user = await currentUser();
  if (!user) redirect('/sign-in');
  let convo;
  try {
    convo = await api.messages.ensureDm(params.userId);
  } catch (e: any) {
    return <div className="p-6">Cannot start DM (are you friends?).</div>;
  }
  const messages = await api.messages.listMessages(convo._id);
  return <DmClient conversation={convo} initialMessages={messages} />;
}

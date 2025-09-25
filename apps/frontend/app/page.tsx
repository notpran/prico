import { Button } from '../components/ui/button';
import { SignInButton, UserButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-bold tracking-tight">Prico</h1>
      <p className="text-muted-foreground max-w-prose">
        Unified collaboration: chat, code, versioning & realtime presence. Core scaffold evolving.
      </p>
      <div className="flex gap-4 items-center">
        <Button>Get Started</Button>
        <Button variant="outline">Docs</Button>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </div>
  );
}

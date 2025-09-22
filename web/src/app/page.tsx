import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
        <h1>Welcome to Prico</h1>
        <Link href="/communities">Browse Communities</Link>
      </SignedIn>
    </div>
  );
}
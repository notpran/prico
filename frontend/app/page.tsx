import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();
  
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Welcome to Prico</h1>
      <p className="text-xl mb-8">Code, Chat, and Collaborate</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Chat</h2>
          <p>Connect with communities and friends</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Code</h2>
          <p>Collaborate on projects in real-time</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Share</h2>
          <p>Publish and fork projects</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link href="/sign-in" className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Sign In
        </Link>
        <Link href="/sign-up" className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md">
          Sign Up
        </Link>
      </div>
    </main>
  );
}
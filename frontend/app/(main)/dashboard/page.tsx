import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, {user.firstName || user.username}</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">Your Communities</h2>
          <p className="text-muted-foreground">Connect with friends and collaborators</p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">No communities yet.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">Your Projects</h2>
          <p className="text-muted-foreground">Manage your coding projects</p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">No projects yet.</p>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on your activities</p>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
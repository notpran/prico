import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="h-24 w-24 rounded-full overflow-hidden">
            <img 
              src={user.imageUrl || "/placeholder-avatar.png"} 
              alt={user.username || "Profile"} 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {user.firstName && user.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user.firstName || user.username || user.id}
            </h1>
            <p className="text-muted-foreground">@{user.username || user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">About Me</h2>
              <p className="text-muted-foreground">
                {(user.publicMetadata?.about as string) || "No bio provided yet."}
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">No recent activity.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Friends</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">No friends added yet.</p>
              </div>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Communities</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">No communities joined yet.</p>
              </div>
            </div>

            <div className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Projects</h2>
              <div className="space-y-4">
                <p className="text-muted-foreground">No projects created yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
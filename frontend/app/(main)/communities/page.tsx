import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function CommunitiesPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // This would fetch communities from our API in a real implementation
  const communities = [];

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Communities</h1>
        <Button asChild>
          <Link href="/communities/new">
            <Plus className="h-4 w-4 mr-2" /> Create Community
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communities.length > 0 ? (
          communities.map((community) => (
            <div key={community.id} className="p-6 bg-card rounded-lg border">
              <h2 className="text-xl font-semibold mb-2">{community.name}</h2>
              <p className="text-muted-foreground mb-4">{community.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {community.members} members
                </span>
                <Button variant="outline" asChild>
                  <Link href={`/communities/${community.id}`}>View</Link>
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No Communities Yet</h3>
            <p className="text-muted-foreground mb-6">
              You haven't joined any communities yet. Create or join a community to get started.
            </p>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/communities/new">
                  <Plus className="h-4 w-4 mr-2" /> Create Community
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/communities/explore">Explore Communities</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
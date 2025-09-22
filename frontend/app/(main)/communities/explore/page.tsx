import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Search,
  Filter,
  Users,
  Globe,
  Lock,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default async function ExploreCommunities() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // This would be fetched from the API in a real implementation
  const popularCommunities = [
    {
      id: "1",
      name: "JavaScript Enthusiasts",
      description: "A community for JavaScript developers to discuss best practices, new features, and help each other with code challenges.",
      members: 1243,
      visibility: "public",
    },
    {
      id: "2",
      name: "Python Coders",
      description: "Share Python tips, discuss libraries, and collaborate on projects with fellow Python enthusiasts.",
      members: 982,
      visibility: "public",
    },
    {
      id: "3",
      name: "Web Dev Professionals",
      description: "For professional web developers to network, share resources, and discuss industry trends.",
      members: 756,
      visibility: "private",
    },
    {
      id: "4",
      name: "UI/UX Design Hub",
      description: "Discuss design principles, share work, and get feedback from other designers.",
      members: 543,
      visibility: "public",
    },
    {
      id: "5",
      name: "DevOps & Cloud",
      description: "Exchange knowledge about DevOps practices, cloud platforms, and infrastructure as code.",
      members: 432,
      visibility: "public",
    },
    {
      id: "6",
      name: "Machine Learning Group",
      description: "For ML engineers and data scientists to discuss algorithms, models, and applications.",
      members: 321,
      visibility: "public",
    },
  ];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Explore Communities</h1>
      
      <div className="mb-8 flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search communities..." 
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" /> Filters
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-4">Popular Communities</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {popularCommunities.map((community) => (
          <Card key={community.id} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{community.name}</h3>
              {community.visibility === "public" ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {community.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {community.members} members
              </div>
              <Button size="sm">Join</Button>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold mb-4">Recommended For You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularCommunities.slice(3).map((community) => (
          <Card key={community.id} className="p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{community.name}</h3>
              {community.visibility === "public" ? (
                <Globe className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
              {community.description}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {community.members} members
              </div>
              <Button size="sm">Join</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
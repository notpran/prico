import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import CommunityForm from "@/components/communities/community-form";

export default async function NewCommunityPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Create a New Community</h1>
        <CommunityForm />
      </div>
    </div>
  );
}
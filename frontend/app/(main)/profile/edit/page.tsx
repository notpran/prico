import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/profile/profile-form";

export default async function EditProfilePage() {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>
        <ProfileForm 
          user={user} 
          initialData={{
            username: user.username || "",
            displayName: user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}` 
              : user.firstName || user.username || "",
            bio: (user.publicMetadata?.about as string) || "",
          }}
        />
      </div>
    </div>
  );
}
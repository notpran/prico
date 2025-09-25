interface ProfilePageProps { params: { username: string } }

export default function ProfilePage({ params }: ProfilePageProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Profile: {params.username}</h2>
      <p className="text-muted-foreground">User profile details, badges, communities, and projects will load here.</p>
    </div>
  );
}

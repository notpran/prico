import { UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/mode-toggle";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";
import Link from "next/link";
import { Home, Users, FolderGit2, Bell } from "lucide-react";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="h-full">
      <div className="fixed inset-y-0 z-50 flex h-full w-[72px] flex-col gap-4 border-r bg-background p-3">
        <Link
          href="/dashboard"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-primary/10 text-primary transition hover:bg-primary/20"
        >
          <Home className="h-5 w-5" />
        </Link>
        <Link
          href="/friends"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-muted text-muted-foreground transition hover:bg-muted/80"
        >
          <Users className="h-5 w-5" />
        </Link>
        <Link
          href="/projects"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-muted text-muted-foreground transition hover:bg-muted/80"
        >
          <FolderGit2 className="h-5 w-5" />
        </Link>
        <Link
          href="/notifications"
          className="flex h-[48px] w-[48px] items-center justify-center rounded-[24px] bg-muted text-muted-foreground transition hover:bg-muted/80"
        >
          <Bell className="h-5 w-5" />
        </Link>
        <div className="mt-auto flex flex-col gap-4">
          <ModeToggle />
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                userButtonAvatarBox: "h-[48px] w-[48px]",
              },
            }}
          />
        </div>
      </div>
      <main className="pl-[72px] h-full">
        {children}
      </main>
    </div>
  );
}
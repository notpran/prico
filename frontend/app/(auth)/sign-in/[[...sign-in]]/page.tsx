import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md p-6 bg-background rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Sign In to Prico</h1>
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 
              "bg-primary hover:bg-primary/90 text-primary-foreground",
            footerActionLink: "text-primary hover:text-primary/90",
          }
        }} 
      />
    </div>
  );
}
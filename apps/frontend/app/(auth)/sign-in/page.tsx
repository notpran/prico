import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <SignIn appearance={{ elements: { formButtonPrimary: 'bg-primary text-primary-foreground' } }} />
    </div>
  );
}

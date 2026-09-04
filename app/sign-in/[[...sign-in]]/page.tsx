import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Reader account"
      title="Welcome back."
      description="Sign in to manage your Fake or Real account and continue reading with the same trusted context."
    >
      <SignIn />
    </AuthShell>
  );
}

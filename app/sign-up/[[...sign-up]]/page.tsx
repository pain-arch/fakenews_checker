import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth-shell";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Create an account"
      title="Join Fake or Real."
      description="Create your reader account while keeping transparent, AI-estimated analysis at the center of every story."
    >
      <SignUp />
    </AuthShell>
  );
}

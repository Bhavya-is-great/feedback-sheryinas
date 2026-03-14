import { redirect } from "next/navigation";
import SignupForm from "@/components/signup/SignupForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Signup | Feedback",
  description: "Create a new account for the feedback platform.",
};

export default async function SignupPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      badge="Create Account"
      title="Start with a secure account"
      description="Sign up once, then use the same account for home, admin access, and password recovery."
    >
      <SignupForm />
    </AuthShell>
  );
}

import { redirect } from "next/navigation";
import LoginForm from "@/components/login/LoginForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Login | Feedback",
  description: "Log in to access the feedback platform.",
};

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      badge="Secure Access"
      title="Log in to continue"
      description="Every page in this app is protected, so start by logging in."
    >
      <LoginForm />
    </AuthShell>
  );
}

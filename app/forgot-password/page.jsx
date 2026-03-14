import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/login/ForgotPasswordForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Forgot Password | Feedback",
  description: "Request a secure password reset link.",
};

export default async function ForgotPasswordPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      badge="Magic Link"
      title="Reset your password by email"
      description="We will send a time-limited reset link to the email attached to your account."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

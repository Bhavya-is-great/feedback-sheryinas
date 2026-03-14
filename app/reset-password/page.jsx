import { redirect } from "next/navigation";
import ResetPasswordForm from "@/components/login/ResetPasswordForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Reset Password | Feedback",
  description: "Use your secure magic link to choose a new password.",
};

export default async function ResetPasswordPage({ searchParams }) {
  const session = await getCurrentSession();
  const resolvedSearchParams = await searchParams;

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      badge="Set New Password"
      title="Choose your next password"
      description="This page only works with a valid magic link from your email."
    >
      <ResetPasswordForm token={resolvedSearchParams?.token || ""} />
    </AuthShell>
  );
}

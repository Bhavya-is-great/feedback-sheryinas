import { redirect } from "next/navigation";
import VerifyOtpForm from "@/components/login/VerifyOtpForm";
import AuthShell from "@/components/ui/AuthShell";
import { getCurrentPendingVerification } from "@/utils/pendingVerification.util";
import { getCurrentSession } from "@/utils/session.util";

export const metadata = {
  title: "Verify OTP | Feedback",
  description: "Verify your email with the one-time password sent to you.",
};

export default async function VerifyOtpPage() {
  const session = await getCurrentSession();
  const pendingVerification = await getCurrentPendingVerification();

  if (session) {
    redirect("/");
  }

  return (
    <AuthShell
      badge="Email Verification"
      title="Finish your account setup"
      description="Enter the OTP from your inbox to verify your email and complete sign in."
    >
      <VerifyOtpForm initialEmail={pendingVerification?.user?.email || ""} />
    </AuthShell>
  );
}

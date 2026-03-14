import LogoutPanel from "@/components/logout/LogoutPanel";
import AuthShell from "@/components/ui/AuthShell";
import { requireUserSession } from "@/utils/session.util";

export const metadata = {
  title: "Logout | Feedback",
  description: "Log out of your current session.",
};

export default async function LogoutPage() {
  await requireUserSession();

  return (
    <AuthShell
      badge="Session Control"
      title="Log out safely"
      description="You are about to close your current authenticated session."
    >
      <LogoutPanel />
    </AuthShell>
  );
}

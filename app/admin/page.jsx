import AdminDashboardPage from "@/components/AdminDashboardPage";
import AuthNavbar from "@/components/globals/AuthNavbar";
import { requireAdminSession } from "@/utils/session.util";

export const metadata = {
  title: "Admin | Feedback",
  description: "Minimal admin page to manage feedback entries.",
};

export default async function AdminPage() {
  const session = await requireAdminSession();

  return (
    <>
      <AuthNavbar user={session.user} />
      <AdminDashboardPage />
    </>
  );
}

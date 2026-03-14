import AuthNavbar from "@/components/globals/AuthNavbar";
import Feedbacks from "@/components/home/Feedbacks";
import { requireUserSession } from "@/utils/session.util";

export default async function HomePage() {
  const session = await requireUserSession();

  return (
    <main>
      <AuthNavbar user={session.user} />
      <Feedbacks />
    </main>
  );
}

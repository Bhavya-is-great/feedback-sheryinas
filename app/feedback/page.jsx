import AuthNavbar from "@/components/globals/AuthNavbar";
import UserFeedbackPage from "@/components/feedback/UserFeedbackPage";
import { requireUserSession } from "@/utils/session.util";

export const metadata = {
  title: "Feedback Wall | Feedback",
  description: "Read and share community feedback in one place.",
};

export default async function FeedbackPage({ searchParams }) {
  const session = await requireUserSession();
  const resolvedSearchParams = await searchParams;
  const feedbackId =
    typeof resolvedSearchParams?.feedbackId === "string"
      ? resolvedSearchParams.feedbackId
      : "";

  return (
    <>
      <AuthNavbar user={session.user} />
      <UserFeedbackPage feedbackId={feedbackId} currentUser={session.user} />
    </>
  );
}

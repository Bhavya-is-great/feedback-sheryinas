"use client";

import { useEffect, useMemo, useState } from "react";
import FeedbackComposer from "@/components/feedback/FeedbackComposer";
import FeedbackFeed from "@/components/feedback/FeedbackFeed";
import { useToast } from "@/components/ui/ToastProvider";
import { formatIstDate, getTime, getIstDayEndMs, isWithinIstDayRange } from "@/utils/date.util";
import {
  getUserFeedbacks,
  likeUserFeedback,
  setUserFeedback,
  updateUserFeedback,
} from "@/utils/feedbackApi.util";
import styles from "@/css/feedback/UserFeedbackPage.module.css";

async function fetchFeedbackFeed(feedbackId) {
  const data = await getUserFeedbacks(feedbackId);

  if (!data.success) {
    throw new Error(data.message || "Unable to load feedback feed.");
  }

  return {
    feedbackWindow: data.data?.feedbackWindow || null,
    feedbacks: data.data?.feedbacks || [],
    currentUserFeedback: data.data?.currentUserFeedback || null,
  };
}

function sortFeedbackItems(items = []) {
  return [...items].sort((left, right) => {
    const likesDifference = Number(right.likesCount || 0) - Number(left.likesCount || 0);

    if (likesDifference !== 0) {
      return likesDifference;
    }

    return getTime(right.createdAt) - getTime(left.createdAt);
  });
}

export default function UserFeedbackPage({ feedbackId = "", currentUser = null }) {
  const toast = useToast();
  const [feedbackWindow, setFeedbackWindow] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [currentUserFeedback, setCurrentUserFeedback] = useState(null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likingFeedbackId, setLikingFeedbackId] = useState("");
  const [editingFeedbackId, setEditingFeedbackId] = useState("");

  function formatDate(value) {
    return formatIstDate(value);
  }

  useEffect(() => {
    let isActive = true;

    async function loadFeedbacks() {
      try {
        setIsLoading(true);
        setFeedbackWindow(null);
        setFeedbacks([]);
        setCurrentUserFeedback(null);

        if (!feedbackId) {
          throw new Error("Open a feedback card first to see its wall.");
        }

        const nextState = await fetchFeedbackFeed(feedbackId);

        if (!isActive) {
          return;
        }

        setFeedbackWindow(nextState.feedbackWindow);
        setFeedbacks(sortFeedbackItems(nextState.feedbacks));
        setCurrentUserFeedback(nextState.currentUserFeedback);
      } catch (error) {
        if (!isActive) {
          return;
        }

        toast.error(error.response?.data?.message || error.message);
        setFeedbackWindow(null);
        setFeedbacks([]);
        setCurrentUserFeedback(null);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadFeedbacks();

    return () => {
      isActive = false;
    };
  }, [feedbackId, toast]);

  const isClosed = useMemo(() => {
    if (!feedbackWindow?.dateEnd) {
      return false;
    }

    return !isWithinIstDayRange(feedbackWindow.dateEnd);
  }, [feedbackWindow]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const data = editingFeedbackId
        ? await updateUserFeedback({
            feedbackId: editingFeedbackId,
            message: draft,
          })
        : await setUserFeedback({
            feedbackId,
            message: draft,
          });

      if (!data.success) {
        throw new Error(data.message || "Unable to save feedback.");
      }

      setDraft("");
      setEditingFeedbackId("");
      setIsComposerOpen(false);

      if (editingFeedbackId) {
        setFeedbacks((current) =>
          sortFeedbackItems(current.map((item) => (item.id === editingFeedbackId ? data.data : item)))
        );
        setCurrentUserFeedback(data.data);
      } else {
        const nextState = await fetchFeedbackFeed(feedbackId);
        setFeedbackWindow(nextState.feedbackWindow);
        setFeedbacks(sortFeedbackItems(nextState.feedbacks));
        setCurrentUserFeedback(nextState.currentUserFeedback);
      }

      toast.success(data.message || "Feedback saved.");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(feedback) {
    setDraft(feedback.message || "");
    setEditingFeedbackId(feedback.id);
    setIsComposerOpen(true);
  }

  async function handleLike(feedbackId) {
    const previousItem = feedbacks.find((item) => item.id === feedbackId) || null;

    if (!previousItem || !currentUser?.id) {
      return;
    }

    setLikingFeedbackId(feedbackId);
    setFeedbacks((current) =>
      sortFeedbackItems(current.map((item) => {
        if (item.id !== feedbackId) {
          return item;
        }

        const nextLikedByMe = !item.likedByMe;
        const nextLikes = nextLikedByMe
          ? [
              ...(Array.isArray(item.likes) ? item.likes : []),
              {
                id: String(currentUser.id),
                name: currentUser.name || "You",
              },
            ]
          : (Array.isArray(item.likes) ? item.likes : []).filter(
              (like) => String(like.id) !== String(currentUser.id)
            );

        return {
          ...item,
          likedByMe: nextLikedByMe,
          likes: nextLikes,
          likesCount: nextLikes.length,
        };
      }))
    );

    try {
      const data = await likeUserFeedback({ feedbackId });

      if (!data.success) {
        throw new Error(data.message || "Unable to update like.");
      }

      setFeedbacks((current) =>
        sortFeedbackItems(current.map((item) => (item.id === feedbackId ? data.data : item)))
      );
    } catch (error) {
      setFeedbacks((current) =>
        sortFeedbackItems(
          current.map((item) => (item.id === feedbackId && previousItem ? previousItem : item))
        )
      );
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLikingFeedbackId("");
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.copy}>
            {isLoading ? (
              <div className={styles.heroSkeleton} aria-hidden="true">
                <span className={styles.skeletonEyebrow} />
                <span className={styles.skeletonTitle} />
                <span className={`${styles.skeletonTitle} ${styles.skeletonTitleShort}`} />
                <div className={styles.skeletonMetaRow}>
                  <span className={styles.skeletonPill} />
                  <span className={`${styles.skeletonPill} ${styles.skeletonPillWide}`} />
                </div>
              </div>
            ) : (
              <>
                <p className={styles.eyebrow}>Community Wall</p>
                <h1 className={styles.title}>
                  {feedbackWindow?.title || "Feedback Wall"}
                </h1>
                {feedbackWindow ? (
                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>Batch {feedbackWindow.batch}</span>
                    <span className={styles.metaPill}>
                      {formatDate(feedbackWindow.dateStart)} to {formatDate(feedbackWindow.dateEnd)}
                    </span>
                    {feedbackWindow.isAnonymous ? (
                      <span className={styles.metaPill}>Anonymous names hidden</span>
                    ) : null}
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className={styles.actions}>
            {isLoading ? (
              <>
                <div className={`${styles.metric} ${styles.metricSkeleton}`} aria-hidden="true" />
                <div className={styles.buttonSkeleton} aria-hidden="true" />
              </>
            ) : (
              <>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Community Posts</span>
                  <strong className={styles.metricValue}>{feedbacks.length}</strong>
                </div>
                <button
                  type="button"
                  className={styles.createButton}
                  onClick={() => setIsComposerOpen(true)}
                  disabled={Boolean(currentUserFeedback) || isClosed}
                >
                  {currentUserFeedback
                    ? "Feedback Submitted"
                    : isClosed
                      ? "Event Closed"
                      : "Add Feedback"}
                </button>
              </>
            )}
          </div>
        </section>

        {!isLoading && isClosed ? (
          <div className={styles.notice}>
            <span className={styles.noticeLabel}>Event Closed</span>
            <p>You can still read and like feedback here, but new feedback can no longer be posted.</p>
          </div>
        ) : null}

        <FeedbackFeed
          key={feedbackId}
          items={feedbacks}
          isLoading={isLoading}
          likingFeedbackId={likingFeedbackId}
          onLike={handleLike}
          currentUserId={currentUser?.id || ""}
          canEdit={!isClosed}
          onEdit={handleEdit}
        />
      </div>

      {isComposerOpen && !isClosed ? (
        <FeedbackComposer
          mode={editingFeedbackId ? "edit" : "create"}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onClose={() => {
            setIsComposerOpen(false);
            setEditingFeedbackId("");
            setDraft("");
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      ) : null}
    </main>
  );
}

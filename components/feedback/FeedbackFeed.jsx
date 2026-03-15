"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import styles from "@/css/feedback/FeedbackFeed.module.css";

export default function FeedbackFeed({
  items,
  isLoading,
  likingFeedbackId,
  onLike,
  currentUserId = "",
  canEdit = false,
  onEdit,
  emptyTitle = "No feedback yet.",
  emptyText = "Be the first person to share one.",
}) {
  const [visibleCount, setVisibleCount] = useState(6);
  const loadMoreRef = useRef(null);
  const visibleItems = useMemo(() => items.slice(0, visibleCount), [items, visibleCount]);
  const hasMore = visibleCount < items.length;

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + 6, items.length));
        }
      },
      {
        rootMargin: "180px 0px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, items.length]);

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className={styles.skeletonCard} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>{emptyTitle}</p>
        <p className={styles.emptyText}>{emptyText}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {visibleItems.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            isLiking={likingFeedbackId === item.id}
            onLike={onLike}
            canEdit={canEdit && String(item.authorId) === String(currentUserId)}
            onEdit={onEdit}
          />
        ))}
      </div>
      {hasMore ? (
        <div ref={loadMoreRef} className={styles.lazyLoader}>
          Loading more...
        </div>
      ) : null}
    </>
  );
}

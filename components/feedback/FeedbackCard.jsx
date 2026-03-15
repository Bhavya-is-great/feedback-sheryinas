"use client";

import { useState } from "react";
import styles from "@/css/feedback/FeedbackCard.module.css";
import { formatIstDate } from "@/utils/date.util";

function formatDate(value) {
  return formatIstDate(value);
}

export default function FeedbackCard({ item, isLiking, onLike, canEdit = false, onEdit }) {
  const [isLikesOpen, setIsLikesOpen] = useState(false);
  const likesLabel = item.likesCount === 1 ? "1 like" : `${item.likesCount} likes`;

  return (
    <>
      <article className={styles.card}>
        <div className={styles.top}>
          <div>
            <p className={styles.name}>{item.authorName}</p>
            <p className={styles.date}>{formatDate(item.createdAt)}</p>
          </div>
          {canEdit ? (
            <button
              type="button"
              className={styles.editButton}
              onClick={() => onEdit?.(item)}
            >
              Edit
            </button>
          ) : null}
        </div>

        <p className={styles.message}>{item.message}</p>

        <div className={styles.reactions}>
          <button
            type="button"
            className={`${styles.heartButton} ${item.likedByMe ? styles.active : ""}`}
            onClick={() => onLike(item.id)}
            disabled={isLiking}
            aria-label={item.likedByMe ? "Remove like" : "Like feedback"}
          >
            <span className={styles.heartIcon} aria-hidden="true">
              {item.likedByMe ? "\u2665" : "\u2661"}
            </span>
          </button>

          <button
            type="button"
            className={styles.likesCountButton}
            onClick={() => setIsLikesOpen(true)}
            disabled={!item.likesCount}
          >
            {likesLabel}
          </button>
        </div>
      </article>

      {isLikesOpen ? (
        <div className={styles.likesOverlay} onClick={() => setIsLikesOpen(false)}>
          <div
            className={styles.likesModal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="People who liked this feedback"
          >
            <div className={styles.likesModalTop}>
              <div>
                <p className={styles.likesEyebrow}>Liked By</p>
                <h3 className={styles.likesTitle}>{likesLabel}</h3>
              </div>
              <button
                type="button"
                className={styles.likesClose}
                onClick={() => setIsLikesOpen(false)}
                aria-label="Close likes popup"
              >
                x
              </button>
            </div>

            {item.likes?.length ? (
              <div className={styles.likesList}>
                {item.likes.map((like) => (
                  <div key={like.id} className={styles.likePerson}>
                    {like.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.likesEmpty}>No likes yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

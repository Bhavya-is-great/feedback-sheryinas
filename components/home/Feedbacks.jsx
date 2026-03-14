"use client";

import { useEffect, useState } from "react";
import http from "@/utils/http.util";
import { sortFeedbacksByDateStartDesc } from "@/utils/feedback.util";
import styles from "@/css/home/Feedbacks.module.css";

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatus(dateEnd) {
  return new Date(dateEnd) >= new Date() ? "Active" : "Closed";
}

export default function Feedbacks() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeedbacks() {
      try {
        const { data } = await http.get("/api/getFeedback", {
          headers: {
            "Cache-Control": "no-store",
          },
        });

        if (!data.success) {
          throw new Error(data.message || "Unable to load feedbacks.");
        }

        setItems(sortFeedbacksByDateStartDesc(data.data || []));
      } catch {
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadFeedbacks();
  }, []);

  return (
    <section id="feedbacks" className={styles.feedbacks}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Feedback Tracker</p>
          <h1 className={styles.title}>Track every feedback card in one place.</h1>
        </div>

        <div className={styles.totalCard}>
          <span className={styles.totalLabel}>Total Feedback</span>
          <strong className={styles.totalCount}>{items.length}</strong>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>Loading feedbacks...</p>
        </div>
      ) : !items.length ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyTitle}>No feedbacks available yet.</p>
          <p className={styles.emptyText}>
            Add a feedback from the admin panel and it will appear here.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item, index) => {
            const status = getStatus(item.dateEnd);
            const isActive = status === "Active";

            return (
              <article key={item._id ?? item.id} className={styles.feedback}>
                <div className={styles.cardTop}>
                  <span className={styles.cardIndex}>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`${styles.badge} ${
                      isActive ? styles.active : styles.completed
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <h2 className={styles.cardTitle}>{item.title}</h2>

                <div className={styles.metaGrid}>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Batch</span>
                    <span className={styles.metaValue}>{item.batch}</span>
                  </div>

                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Date Start</span>
                    <span className={styles.metaValue}>
                      {formatDate(item.dateStart)}
                    </span>
                  </div>

                  <div className={styles.metaBlock}>
                    <span className={styles.metaLabel}>Date End</span>
                    <span className={styles.metaValue}>
                      {formatDate(item.dateEnd)}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

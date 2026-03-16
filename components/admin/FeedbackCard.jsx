import styles from "@/css/admin/FeedbackCard.module.css";

export default function FeedbackCard({ item, isEditing = false, onEdit }) {
  return (
    <article className={`${styles.card} ${isEditing ? styles.cardEditing : ""}`}>
      <div className={styles.top}>
        <span className={styles.batch}>{item.batch}</span>
        <div className={styles.topActions}>
          <span className={styles.badge}>{item.anonymityLabel}</span>
          <button type="button" className={styles.editButton} onClick={() => onEdit?.(item)}>
            Edit
          </button>
        </div>
      </div>

      <h3 className={styles.title}>{item.title}</h3>

      <dl className={styles.meta}>
        <div className={styles.metaItem}>
          <dt className={styles.label}>Date Start</dt>
          <dd className={styles.value}>{item.dateStartLabel}</dd>
        </div>
        <div className={styles.metaItem}>
          <dt className={styles.label}>Date End</dt>
          <dd className={styles.value}>{item.dateEndLabel}</dd>
        </div>
      </dl>
    </article>
  );
}

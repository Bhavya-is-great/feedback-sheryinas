import FeedbackCard from "@/components/admin/FeedbackCard";
import styles from "@/css/admin/FeedbackList.module.css";

export default function FeedbackList({ items, isLoading }) {
  if (isLoading) {
    return <p className={styles.empty}>Loading feedbacks...</p>;
  }

  if (!items.length) {
    return <p className={styles.empty}>No feedbacks saved yet.</p>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => (
        <FeedbackCard key={item._id} item={item} />
      ))}
    </div>
  );
}

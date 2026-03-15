"use client";

import AuthButton from "@/components/ui/AuthButton";
import styles from "@/css/feedback/FeedbackComposer.module.css";

export default function FeedbackComposer(props) {
  const { value, onChange, onClose, onSubmit, isSubmitting, mode = "create" } = props;
  const isEditMode = mode === "edit";

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.top}>
          <div>
            <p className={styles.eyebrow}>Share Once</p>
            <h2 className={styles.title}>
              {isEditMode ? "Edit your feedback" : "Add your feedback"}
            </h2>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            <span className={styles.label}>Your feedback</span>
            <textarea
              className={styles.textarea}
              value={value}
              onChange={onChange}
              placeholder="Write what worked, what didn't, and what should improve next."
              maxLength={1200}
              disabled={isSubmitting}
              required
            />
          </label>

          <div className={styles.footer}>
            <span className={styles.hint}>12 to 1200 characters. One feedback per user.</span>
            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (isEditMode ? "Saving..." : "Posting...") : isEditMode ? "Save Changes" : "Post Feedback"}
            </AuthButton>
          </div>
        </form>
      </div>
    </div>
  );
}

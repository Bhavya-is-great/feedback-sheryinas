import FormField from "@/components/admin/FormField";
import styles from "@/css/admin/FeedbackForm.module.css";

export default function FeedbackForm({
  form,
  error,
  success,
  isSubmitting,
  onChange,
  onSubmit,
  onCancelEdit,
}) {
  const isEditing = Boolean(form.feedbackId);

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={onChange}
        placeholder="Homepage review"
      />

      <FormField
        label="Batch"
        name="batch"
        value={form.batch}
        onChange={onChange}
        placeholder="Batch A1"
      />

      <div className={styles.row}>
        <FormField
          label="Date Start"
          name="dateStart"
          type="date"
          value={form.dateStart}
          onChange={onChange}
        />

        <FormField
          label="Date End"
          name="dateEnd"
          type="date"
          value={form.dateEnd}
          onChange={onChange}
        />
      </div>

      <label className={styles.toggleRow}>
        <span>
          <strong className={styles.toggleTitle}>Anonymous Mode</strong>
          <small className={styles.toggleHint}>
            When this is on, feedback cards will show User instead of the saved name.
          </small>
        </span>
        <input
          type="checkbox"
          name="isAnonymous"
          checked={Boolean(form.isAnonymous)}
          onChange={onChange}
          className={styles.toggleInput}
        />
      </label>

      {(error || success) && (
        <p className={error ? styles.error : styles.success}>
          {error || success}
        </p>
      )}

      <div className={styles.actions}>
        <button className={styles.button} type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Feedback" : "Save Feedback"}
        </button>
        {isEditing ? (
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

import FormField from "@/components/admin/FormField";
import styles from "@/css/admin/FeedbackForm.module.css";

export default function FeedbackForm({
  form,
  error,
  success,
  isSubmitting,
  onChange,
  onSubmit,
}) {
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

      {(error || success) && (
        <p className={error ? styles.error : styles.success}>
          {error || success}
        </p>
      )}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Feedback"}
      </button>
    </form>
  );
}

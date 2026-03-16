"use client";

import { useEffect, useMemo, useState } from "react";
import http from "@/utils/http.util";
import { formatIstDate, isWithinIstDayRange } from "@/utils/date.util";
import AdminHero from "@/components/admin/AdminHero";
import AdminMetrics from "@/components/admin/AdminMetrics";
import AdminSection from "@/components/admin/AdminSection";
import FeedbackForm from "@/components/admin/FeedbackForm";
import FeedbackList from "@/components/admin/FeedbackList";
import styles from "@/css/admin/AdminFeedbackPage.module.css";

const initialForm = {
  feedbackId: "",
  title: "",
  batch: "",
  dateStart: "",
  dateEnd: "",
  isAnonymous: false,
};

function formatDateLabel(value) {
  return formatIstDate(value);
}

function formatDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

export default function AdminDashboardPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadFeedbacks() {
    try {
      setError("");
      setIsLoading(true);
      const { data } = await http.get("/api/getFeedback?includeAll=true");
      if (!data.success) throw new Error(data.message || "Unable to load feedbacks.");
      setFeedbacks(data.data || []);
    } catch (loadError) {
      setError(loadError.response?.data?.message || loadError.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks();
  }, []);

  const metrics = useMemo(() => {
    const total = feedbacks.length;
    const active = feedbacks.filter(({ dateEnd }) => isWithinIstDayRange(dateEnd)).length;
    const batches = new Set(feedbacks.map(({ batch }) => batch)).size;
    return [
      { label: "Total Feedbacks", value: total },
      { label: "Active Windows", value: active },
      { label: "Batches", value: batches },
    ];
  }, [feedbacks]);

  const mappedFeedbacks = useMemo(
    () =>
      feedbacks.map((item) => ({
        ...item,
        feedbackId: item._id || item.id || "",
        dateStartLabel: formatDateLabel(item.dateStart),
        dateEndLabel: formatDateLabel(item.dateEnd),
        anonymityLabel: item.isAnonymous ? "Anonymous" : "Named",
      })),
    [feedbacks]
  );

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function handleEdit(item) {
    setError("");
    setSuccess("");
    setForm({
      feedbackId: item.feedbackId,
      title: item.title || "",
      batch: item.batch || "",
      dateStart: formatDateInputValue(item.dateStart),
      dateEnd: formatDateInputValue(item.dateEnd),
      isAnonymous: Boolean(item.isAnonymous),
    });
  }

  function handleCancelEdit() {
    setError("");
    setSuccess("");
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);
    try {
      const isEditing = Boolean(form.feedbackId);
      const { data } = isEditing
        ? await http.patch("/api/createFeedback", form)
        : await http.post("/api/createFeedback", form);
      if (!data.success) {
        throw new Error(
          data.message || (isEditing ? "Unable to update feedback." : "Unable to create feedback.")
        );
      }
      setSuccess(isEditing ? "Feedback updated." : "Feedback added.");
      setForm(initialForm);
      await loadFeedbacks();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <AdminHero
          eyebrow="Admin Panel"
          title="Create and track feedback windows with a minimal workflow."
          description="Create feedback windows, edit them later, and switch anonymous mode on or off without losing stored names."
        />
        <AdminMetrics items={metrics} />
        <div className={styles.grid}>
          <AdminSection
            title={form.feedbackId ? "Edit Feedback" : "Add Feedback"}
            description={
              form.feedbackId
                ? "Update the window details or change whether names stay hidden."
                : "Publish a new feedback window."
            }
          >
            <FeedbackForm
              form={form}
              error={error}
              success={success}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancelEdit={handleCancelEdit}
            />
          </AdminSection>
          <AdminSection title="Recent Feedbacks" description="Every saved entry from the database.">
            <FeedbackList
              items={mappedFeedbacks}
              isLoading={isLoading}
              editingFeedbackId={form.feedbackId}
              onEdit={handleEdit}
            />
          </AdminSection>
        </div>
      </div>
    </main>
  );
}

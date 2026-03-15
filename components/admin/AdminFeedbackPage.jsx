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
  title: "",
  batch: "",
  dateStart: "",
  dateEnd: "",
};

function formatDateLabel(value) {
  return formatIstDate(value);
}

export default function AdminFeedbackPage({ adminPassword }) {
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

      const { data } = await http.get("/api/getFeedback", {
        headers: {
          "Cache-Control": "no-store",
        },
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to load feedbacks.");
      }

      setFeedbacks(data.data || []);
    } catch (loadError) {
      setError(loadError.message);
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
        dateStartLabel: formatDateLabel(item.dateStart),
        dateEndLabel: formatDateLabel(item.dateEnd),
      })),
    [feedbacks]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/createFeedback", form, {
        headers: {
          "x-admin-password": adminPassword,
        },
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to create feedback.");
      }

      setSuccess("Feedback added.");
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
          description="This panel only manages the four required fields: title, batch, date start and date end."
        />

        <AdminMetrics items={metrics} />

        <div className={styles.grid}>
          <AdminSection
            title="Add Feedback"
            description="Publish a new feedback window."
          >
            <FeedbackForm
              form={form}
              error={error}
              success={success}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
            />
          </AdminSection>

          <AdminSection
            title="Recent Feedbacks"
            description="Every saved entry from the database."
          >
            <FeedbackList items={mappedFeedbacks} isLoading={isLoading} />
          </AdminSection>
        </div>
      </div>
    </main>
  );
}

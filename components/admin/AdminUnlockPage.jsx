"use client";

import { useState } from "react";
import http from "@/utils/http.util";
import AdminHero from "@/components/admin/AdminHero";
import AdminSection from "@/components/admin/AdminSection";
import FormField from "@/components/admin/FormField";
import styles from "@/css/admin/AdminUnlockPage.module.css";

export default function AdminUnlockPage({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/admin/verify", { password });

      if (!data.success) {
        throw new Error(data.message || "Unable to unlock admin.");
      }

      onUnlock(password);
    } catch (unlockError) {
      setError(unlockError.response?.data?.message || unlockError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <AdminHero
          eyebrow="Restricted Access"
          title="Unlock the admin panel before you can use it."
          description="Every visit to the admin page requires the main password."
        />

        <AdminSection
          title="Admin Unlock"
          description="Enter the password backed by MAIN_PASS."
        >
          <form className={styles.form} onSubmit={handleSubmit}>
            <FormField
              label="Main Password"
              name="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
            />

            {error && <p className={styles.error}>{error}</p>}

            <button
              className={styles.button}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Unlock Admin"}
            </button>
          </form>
        </AdminSection>
      </div>
    </main>
  );
}

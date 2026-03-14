"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthMessage from "@/components/ui/AuthMessage";
import styles from "@/css/logout/LogoutPanel.module.css";

export default function LogoutPanel() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setError("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/logout");

      if (!data.success) {
        throw new Error(data.message || "Unable to log out.");
      }

      router.replace("/login");
      router.refresh();
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.text}>
        End your current session from here when you are done.
      </p>
      <AuthMessage>{error}</AuthMessage>
      <div className={styles.actions}>
        <AuthButton type="button" disabled={isSubmitting} onClick={handleLogout}>
          {isSubmitting ? "Logging out..." : "Log Out"}
        </AuthButton>
        <Link href="/" className={styles.link}>
          Back to home
        </Link>
      </div>
    </div>
  );
}

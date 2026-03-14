"use client";

import Link from "next/link";
import { useState } from "react";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import AuthMessage from "@/components/ui/AuthMessage";
import styles from "@/css/login/ForgotPasswordForm.module.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/forgot-password", { email });

      if (!data.success) {
        throw new Error(data.message || "Unable to send reset link.");
      }

      setSuccess(data.message);
      setEmail("");
    } catch (submitError) {
      setError(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AuthField
        label="Email"
        name="email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
      />
      <AuthMessage>{error}</AuthMessage>
      <AuthMessage tone="success">{success}</AuthMessage>
      <AuthButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Magic Link"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/login">Back to login</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import http from "@/utils/http.util";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import styles from "@/css/signup/SignupForm.module.css";

export default function SignupForm() {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/signup", form);

      if (!data.success) {
        throw new Error(data.message || "Unable to create account.");
      }

      toast.success(data.message || "Verification code sent.");
      router.replace("/verify-otp");
      router.refresh();
    } catch (submitError) {
      toast.error(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AuthField
        label="Full Name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Your name"
        autoComplete="name"
        disabled={isSubmitting}
      />
      <AuthField
        label="Email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
      />
      <AuthField
        label="Password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="8+ chars, Aa1@ required"
        autoComplete="new-password"
        disabled={isSubmitting}
      />
      <AuthField
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={form.confirmPassword}
        onChange={handleChange}
        placeholder="Repeat your password"
        autoComplete="new-password"
        disabled={isSubmitting}
      />
      <AuthButton type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Account"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/login">Already have an account?</Link>
      </div>
    </form>
  );
}

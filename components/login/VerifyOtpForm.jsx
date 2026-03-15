"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/ToastProvider";
import AuthButton from "@/components/ui/AuthButton";
import AuthField from "@/components/ui/AuthField";
import http from "@/utils/http.util";
import styles from "@/css/login/LoginForm.module.css";

export default function VerifyOtpForm({ initialEmail = "" }) {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResolvingEmail, setIsResolvingEmail] = useState(!initialEmail);

  function getMaskedEmail(email) {
    const [localPart, domain = ""] = String(email).split("@");

    if (!localPart || !domain) {
      return "your email";
    }

    const visibleLocalPart = localPart.length <= 2
      ? `${localPart[0] || ""}*`
      : `${localPart.slice(0, 2)}${"*".repeat(Math.max(localPart.length - 2, 1))}`;

    return `${visibleLocalPart}@${domain}`;
  }

  useEffect(() => {
    setEmail(initialEmail.trim().toLowerCase());
    setIsResolvingEmail(!initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    if (initialEmail) {
      return;
    }

    let isActive = true;

    async function loadPendingVerification() {
      try {
        const { data } = await http.get("/api/auth/pending-verification");
        const pendingEmail = data?.data?.email || "";

        if (!isActive) {
          return;
        }

        if (!pendingEmail) {
          toast.error("Verification email is missing. Please sign up or log in again.");
          router.replace("/login");
          return;
        }

        setEmail(String(pendingEmail).trim().toLowerCase());
      } catch {
        if (isActive) {
          toast.error("Unable to load your verification request. Please log in again.");
          router.replace("/login");
        }
      } finally {
        if (isActive) {
          setIsResolvingEmail(false);
        }
      }
    }

    loadPendingVerification();

    return () => {
      isActive = false;
    };
  }, [initialEmail, router, toast]);

  useEffect(() => {
    if (resendCountdown <= 0) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setResendCountdown((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [resendCountdown]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email || isResolvingEmail) {
      toast.error("Verification email is missing. Please sign up or log in again.");
      router.replace("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data } = await http.post("/api/auth/verify-otp", {
        email,
        otp,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to verify OTP.");
      }

      toast.success(data.message || "Email verified successfully.");
      router.replace("/");
      router.refresh();
    } catch (submitError) {
      toast.error(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendOtp() {
    if (!email || isResolvingEmail) {
      toast.error("Verification email is missing. Please sign up or log in again.");
      router.replace("/login");
      return;
    }

    setIsResending(true);

    try {
      const { data } = await http.post("/api/auth/resend-otp", {
        email,
      });

      if (!data.success) {
        throw new Error(data.message || "Unable to resend OTP.");
      }

      setResendCountdown(60);
      toast.success(data.message);
    } catch (submitError) {
      const retryAfterSeconds = submitError.response?.data?.data?.retryAfterSeconds;

      if (retryAfterSeconds) {
        setResendCountdown(retryAfterSeconds);
      }

      toast.error(submitError.response?.data?.message || submitError.message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <AuthField
        label="OTP"
        name="otp"
        value={otp}
        onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
        placeholder="Enter 6-digit OTP"
        autoComplete="one-time-code"
        disabled={isSubmitting || isResending || isResolvingEmail}
      />
      <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "0.92rem", lineHeight: 1.6 }}>
        {isResolvingEmail
          ? "Preparing your verification request..."
          : `We sent a 6-digit verification code to ${getMaskedEmail(email)}. It expires in 1 hour.`}
      </p>
      <AuthButton type="submit" disabled={isSubmitting || isResending || isResolvingEmail}>
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </AuthButton>
      <AuthButton
        type="button"
        disabled={isSubmitting || isResending || isResolvingEmail || resendCountdown > 0}
        onClick={handleResendOtp}
      >
        {isResending
          ? "Sending..."
          : resendCountdown > 0
            ? `Resend OTP in ${resendCountdown}s`
            : "Resend OTP"}
      </AuthButton>
      <div className={styles.links}>
        <Link href="/login">Back to login</Link>
        <Link href="/signup">Create account</Link>
      </div>
    </form>
  );
}

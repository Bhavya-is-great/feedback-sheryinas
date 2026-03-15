import { connectDB } from "@/config/db.congif";
import Session from "@/models/sessionModel";
import User from "@/models/userModel";
import {
  getPublicUser,
  getUserRole,
  normalizeEmail,
  normalizeName,
  validateForgotPasswordPayload,
  validateLoginPayload,
  validateResetPasswordPayload,
  validateSignupPayload,
  validateVerifyOtpPayload,
} from "@/utils/auth.util";
import { deleteSessionsByUserId, createSessionForUser } from "@/utils/session.util";
import {
  getPendingVerificationByUserId,
  savePendingVerificationForUser,
  deletePendingVerificationByUserId,
} from "@/utils/pendingVerification.util";
import {
  hashPassword,
  verifyPassword,
  createOpaqueToken,
  createNumericOtp,
  hashToken,
} from "@/utils/crypto.util";
import { sendMail } from "@/utils/mailer.util";
import {
  getEmailOtpTemplate,
  getResetPasswordTemplate,
  getWelcomeEmailTemplate,
} from "@/utils/emailTemplates.util";
import { getFutureDate, getNowDate, getNowMs, getTime, isAfterNow } from "@/utils/date.util";

const EMAIL_OTP_WINDOW_MS = 1000 * 60 * 60;
const OTP_RESEND_COOLDOWN_MS = 1000 * 60;
const MAX_OTP_RESENDS_PER_WINDOW = 3;

async function sendEmailOtp(user, otp) {
  const otpEmail = getEmailOtpTemplate({
    name: user.name,
    otp,
  });

  await sendMail({
    to: user.email,
    ...otpEmail,
  });
}

function hasUnexpiredPendingVerification(pendingVerification) {
  return Boolean(
    pendingVerification?.otp &&
      pendingVerification?.expiresAt &&
      isAfterNow(pendingVerification.expiresAt)
  );
}

function getOtpResendPolicy(pendingVerification) {
  const now = getNowMs();
  const firstSentAt = pendingVerification?.firstSentAt
    ? getTime(pendingVerification.firstSentAt)
    : 0;
  const lastSentAt = pendingVerification?.lastSentAt
    ? getTime(pendingVerification.lastSentAt)
    : 0;

  if (!firstSentAt || now - firstSentAt >= EMAIL_OTP_WINDOW_MS) {
    return {
      canResetWindow: true,
      cooldownRemainingMs: 0,
      resendCount: 0,
    };
  }

  const cooldownRemainingMs = Math.max(OTP_RESEND_COOLDOWN_MS - (now - lastSentAt), 0);

  return {
    canResetWindow: false,
    cooldownRemainingMs,
    resendCount: Number(pendingVerification?.resendCount || 0),
  };
}

async function issueNewEmailOtp(user) {
  const otp = createNumericOtp();
  const now = getNowDate();
  const expiresAt = getFutureDate(EMAIL_OTP_WINDOW_MS);
  const pendingVerification = await savePendingVerificationForUser(user._id, {
    otp,
    expiresAt,
    firstSentAt: now,
    lastSentAt: now,
    resendCount: 0,
  });

  await sendEmailOtp(user, otp);

  return pendingVerification;
}

async function resendEmailOtp(user) {
  const pendingVerification = await getPendingVerificationByUserId(user._id);
  const policy = getOtpResendPolicy(pendingVerification);

  if (hasUnexpiredPendingVerification(pendingVerification)) {
    if (policy.cooldownRemainingMs > 0) {
      const seconds = Math.ceil(policy.cooldownRemainingMs / 1000);
      return {
        ok: false,
        status: 429,
        message: `Please wait ${seconds} seconds before requesting another OTP.`,
        retryAfterSeconds: seconds,
      };
    }

    if (policy.resendCount >= MAX_OTP_RESENDS_PER_WINDOW) {
      return {
        ok: false,
        status: 429,
        message: "You have reached the OTP resend limit. Please wait 1 hour and try again.",
      };
    }

    const now = getNowDate();
    const nextFirstSentAt = pendingVerification.firstSentAt || pendingVerification.lastSentAt || now;
    const nextResendCount = Number(pendingVerification.resendCount || 0) + 1;

    await savePendingVerificationForUser(user._id, {
      otp: pendingVerification.otp,
      expiresAt: pendingVerification.expiresAt,
      firstSentAt: nextFirstSentAt,
      lastSentAt: now,
      resendCount: nextResendCount,
    });
    await sendEmailOtp(user, pendingVerification.otp);

    return {
      ok: true,
      message: "Your existing OTP has been resent to your email.",
      pendingVerification: {
        token: pendingVerification.token,
        expiresAt: pendingVerification.expiresAt,
      },
    };
  }

  if (policy.canResetWindow) {
    const nextPendingVerification = await issueNewEmailOtp(user);
    return {
      ok: true,
      message: "Your previous OTP had expired, so a new OTP has been sent to your email.",
      pendingVerification: nextPendingVerification,
    };
  }

  return {
    ok: false,
    status: 400,
    message: "There is no active OTP to resend right now.",
  };
}

export async function signupController(payload) {
  const validationError = validateSignupPayload(payload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError,
    };
  }

  await connectDB();

  const name = normalizeName(payload.name);
  const email = normalizeEmail(payload.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return {
      success: false,
      status: 409,
      message: "An account with this email already exists. Please log in instead.",
    };
  }

  const user = await User.create({
    name,
    email,
    passwordHash: hashPassword(payload.password),
    role: getUserRole(email),
  });

  try {
    const pendingVerification = await issueNewEmailOtp(user);

    return {
      success: true,
      status: 201,
      message: "Verification code sent to your email.",
      data: {
        email: user.email,
        requiresOtpVerification: true,
      },
      pendingVerification,
    };
  } catch {
    await User.deleteOne({ _id: user._id });

    return {
      success: false,
      status: 500,
      message: "Unable to send verification code right now.",
    };
  }

}

export async function loginController(payload) {
  const validationError = validateLoginPayload(payload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError,
    };
  }

  await connectDB();

  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ email });

  if (!user || !verifyPassword(payload.password, user.passwordHash)) {
    return {
      success: false,
      status: 401,
      message: "Invalid email or password.",
    };
  }

  if (!user.isVerified) {
    const pendingVerification = await getPendingVerificationByUserId(user._id);

    if (hasUnexpiredPendingVerification(pendingVerification)) {
      return {
        success: false,
        status: 403,
        message: "Your account is not verified yet. Please enter the OTP already sent to your email.",
        data: {
          email: user.email,
          requiresOtpVerification: true,
        },
        pendingVerification: {
          token: pendingVerification.token,
          expiresAt: pendingVerification.expiresAt,
        },
      };
    }

    const policy = getOtpResendPolicy(pendingVerification);

    if (policy.canResetWindow) {
      try {
        const nextPendingVerification = await issueNewEmailOtp(user);

        return {
          success: false,
          status: 403,
          message: "Your account is not verified yet. A new OTP has been sent.",
          data: {
            email: user.email,
            requiresOtpVerification: true,
          },
          pendingVerification: nextPendingVerification,
        };
      } catch {
        return {
          success: false,
          status: 500,
          message: "Unable to send verification code right now.",
        };
      }
    }

    return {
      success: false,
      status: 403,
      message:
        policy.cooldownRemainingMs > 0
          ? `Your account is not verified yet. Please use the existing OTP or wait ${Math.ceil(
              policy.cooldownRemainingMs / 1000
            )} seconds to request a new one.`
          : "Your account is not verified yet. Please verify with your existing OTP.",
      data: {
        email: user.email,
        requiresOtpVerification: true,
      },
      pendingVerification: pendingVerification
        ? {
            token: pendingVerification.token,
            expiresAt: pendingVerification.expiresAt,
          }
        : null,
    };
  }

  const session = await createSessionForUser(user._id);

  return {
    success: true,
    status: 200,
    message: "Logged in successfully.",
    data: {
      user: getPublicUser(user),
    },
    session,
  };
}

export async function verifyOtpController(payload) {
  const validationError = validateVerifyOtpPayload(payload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError,
    };
  }

  await connectDB();

  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ email });
  const pendingVerification = user ? await getPendingVerificationByUserId(user._id) : null;

  if (!user || user.isVerified) {
    return {
      success: false,
      status: 400,
      message: "This OTP is invalid or no longer available.",
    };
  }

  if (!pendingVerification || !pendingVerification.otp || pendingVerification.expiresAt <= getNowDate()) {
    return {
      success: false,
      status: 400,
      message: "This OTP has expired. Please request a new one.",
    };
  }

  if (String(payload.otp) !== String(pendingVerification.otp)) {
    return {
      success: false,
      status: 400,
      message: "Invalid OTP. Please try again.",
    };
  }

  user.isVerified = true;
  await user.save();
  await deletePendingVerificationByUserId(user._id);

  const session = await createSessionForUser(user._id);

  try {
    const welcomeEmail = getWelcomeEmailTemplate({ name: user.name });
    await sendMail({
      to: user.email,
      ...welcomeEmail,
    });
  } catch {
  }

  return {
    success: true,
    status: 200,
    message: "Email verified successfully.",
    data: {
      user: getPublicUser(user),
    },
    session,
  };
}

export async function resendOtpController(payload) {
  const email = normalizeEmail(payload?.email);

  if (!email) {
    return {
      success: false,
      status: 400,
      message: "email is required.",
    };
  }

  await connectDB();

  const user = await User.findOne({ email });
  let resendResult = null;

  if (!user || user.isVerified) {
    return {
      success: false,
      status: 404,
      message: "No pending verification found for this email.",
    };
  }

  try {
    resendResult = await resendEmailOtp(user);

    if (!resendResult.ok) {
      return {
        success: false,
        status: resendResult.status,
        message: resendResult.message,
        data: resendResult.retryAfterSeconds
          ? { retryAfterSeconds: resendResult.retryAfterSeconds }
          : null,
      };
    }
  } catch {
    return {
      success: false,
      status: 500,
      message: "Unable to send verification code right now.",
    };
  }

  return {
    success: true,
    status: 200,
    message: resendResult?.message || "Your existing OTP has been resent to your email.",
    data: {
      email: user.email,
      requiresOtpVerification: true,
    },
    pendingVerification: resendResult?.pendingVerification || null,
  };
}

export async function logoutController(sessionToken) {
  if (sessionToken) {
    await connectDB();
    await Session.deleteOne({ tokenHash: hashToken(sessionToken) });
  }

  return {
    success: true,
    status: 200,
    message: "Logged out successfully.",
  };
}

export async function forgotPasswordController(payload, origin) {
  const validationError = validateForgotPasswordPayload(payload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError,
    };
  }

  await connectDB();

  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = createOpaqueToken();
    const resetPasswordExpiresAt = getFutureDate(1000 * 60 * 15);

    user.resetPasswordTokenHash = hashToken(resetToken);
    user.resetPasswordExpiresAt = resetPasswordExpiresAt;
    await user.save();

    const resetLink = `${origin}/reset-password?token=${resetToken}`;
    const resetEmail = getResetPasswordTemplate({
      name: user.name,
      resetLink,
    });

    await sendMail({
      to: user.email,
      ...resetEmail,
    });
  }

  return {
    success: true,
    status: 200,
    message:
      "If an account exists with that email, a reset link has been sent.",
  };
}

export async function resetPasswordController(payload) {
  const validationError = validateResetPasswordPayload(payload);

  if (validationError) {
    return {
      success: false,
      status: 400,
      message: validationError,
    };
  }

  await connectDB();

  const user = await User.findOne({
    resetPasswordTokenHash: hashToken(payload.token),
    resetPasswordExpiresAt: { $gt: getNowDate() },
  });

  if (!user) {
    return {
      success: false,
      status: 400,
      message: "This reset link is invalid or has expired.",
    };
  }

  user.passwordHash = hashPassword(payload.password);
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  await deleteSessionsByUserId(user._id);
  const session = await createSessionForUser(user._id);

  return {
    success: true,
    status: 200,
    message: "Password reset successfully.",
    data: {
      user: getPublicUser(user),
    },
    session,
  };
}

export async function getSessionController(session) {
  return {
    success: true,
    status: 200,
    data: {
      user: session.user,
    },
  };
}

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
} from "@/utils/auth.util";
import { deleteSessionsByUserId, createSessionForUser } from "@/utils/session.util";
import { hashPassword, hashToken, verifyPassword, createOpaqueToken } from "@/utils/crypto.util";
import { sendMail } from "@/utils/mailer.util";
import {
  getOwnerSignupTemplate,
  getResetPasswordTemplate,
  getWelcomeEmailTemplate,
} from "@/utils/emailTemplates.util";

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
      message: "An account with this email already exists.",
    };
  }

  const user = await User.create({
    name,
    email,
    passwordHash: hashPassword(payload.password),
    role: getUserRole(email),
  });

  const session = await createSessionForUser(user._id);

  try {
    const welcomeEmail = getWelcomeEmailTemplate({ name: user.name });
    await sendMail({
      to: user.email,
      ...welcomeEmail,
    });

    if (process.env.OWNER_EMAIL) {
      const ownerEmail = getOwnerSignupTemplate({
        name: user.name,
        email: user.email,
      });
      await sendMail({
        to: process.env.OWNER_EMAIL,
        ...ownerEmail,
      });
    }
  } catch (error) {
    console.error("Failed to send signup mail:", error);
  }

  return {
    success: true,
    status: 201,
    message: "Account created successfully.",
    data: {
      user: getPublicUser(user),
    },
    session,
  };
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
    const resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 15);

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
    resetPasswordExpiresAt: { $gt: new Date() },
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

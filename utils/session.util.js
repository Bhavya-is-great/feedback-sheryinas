import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "@/config/db.congif";
import Session from "@/models/sessionModel";
import User from "@/models/userModel";
import { hashToken, createOpaqueToken } from "@/utils/crypto.util";
import { getPublicUser } from "@/utils/auth.util";
import { getEpochDate, getFutureDate, getNowDate } from "@/utils/date.util";

export const SESSION_COOKIE_NAME = "feedback_session";
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

export function getSessionCookieOptions(expiresAt) {
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  };
}

export async function createSessionForUser(userId) {
  await connectDB();

  const token = createOpaqueToken();
  const expiresAt = getFutureDate(SESSION_MAX_AGE_MS);

  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  return {
    token,
    expiresAt,
  };
}

export function applySessionCookie(response, session) {
  response.cookies.set({
    ...getSessionCookieOptions(session.expiresAt),
    value: session.token,
  });
}

export function clearSessionCookie(response) {
  response.cookies.set({
    ...getSessionCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function setSessionCookie(session) {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getSessionCookieOptions(session.expiresAt),
    value: session.token,
  });
}

export async function removeSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set({
    ...getSessionCookieOptions(getEpochDate()),
    value: "",
  });
}

export async function deleteSessionByToken(token) {
  if (!token) {
    return;
  }

  await connectDB();
  await Session.deleteOne({ tokenHash: hashToken(token) });
}

export async function deleteSessionsByUserId(userId) {
  await connectDB();
  await Session.deleteMany({ userId });
}

export async function getCurrentSessionFromToken(token) {
  if (!token) {
    return null;
  }

  await connectDB();

  const session = await Session.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: getNowDate() },
  }).lean();

  if (!session) {
    return null;
  }

  const user = await User.findById(session.userId).lean();

  if (!user) {
    await Session.deleteOne({ _id: session._id });
    return null;
  }

  return {
    id: String(session._id),
    expiresAt: session.expiresAt,
    user: getPublicUser(user),
  };
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getCurrentSessionFromToken(token);
}

export async function requireUserSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function requireAdminSession() {
  const session = await requireUserSession();

  if (session.user.role !== "admin") {
    redirect("/");
  }

  return session;
}

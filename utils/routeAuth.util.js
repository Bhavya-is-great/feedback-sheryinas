import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getCurrentSessionFromToken } from "@/utils/session.util";

export async function requireApiSession(request, options = {}) {
  const { adminOnly = false } = options;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await getCurrentSessionFromToken(token);

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "Please log in to continue.",
        },
        { status: 401 }
      ),
    };
  }

  if (adminOnly && session.user.role !== "admin") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          message: "You are not allowed to access this resource.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    session,
    errorResponse: null,
  };
}

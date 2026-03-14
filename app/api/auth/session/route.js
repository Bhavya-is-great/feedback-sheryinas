import { getSessionController } from "@/controllers/auth.controller";
import { createSuccessResponse } from "@/utils/api.util";
import { requireApiSession } from "@/utils/routeAuth.util";

export async function GET(request) {
  const { session, errorResponse } = await requireApiSession(request);

  if (errorResponse) {
    return errorResponse;
  }

  const result = await getSessionController(session);
  return createSuccessResponse(result);
}

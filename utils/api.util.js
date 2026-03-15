import { NextResponse } from "next/server";

export function createSuccessResponse(result) {
  return NextResponse.json(
    {
      success: result.success,
      message: result.message,
      data: result.data ?? null,
    },
    { status: result.status }
  );
}

export function createErrorResponse(error, fallbackMessage) {
  const status = Number(error?.status || error?.statusCode || 500);

  return NextResponse.json(
    {
      success: false,
      message: error.message || fallbackMessage,
    },
    { status }
  );
}

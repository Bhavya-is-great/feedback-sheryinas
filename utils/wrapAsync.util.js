import { createErrorResponse } from "@/utils/api.util";

export default function wrapAsync(handler, fallbackMessage = "Something went wrong.") {
  return async function wrappedHandler(...args) {
    try {
      return await handler(...args);
    } catch (error) {
      return createErrorResponse(error, fallbackMessage);
    }
  };
}

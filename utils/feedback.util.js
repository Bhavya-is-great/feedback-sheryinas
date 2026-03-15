import { createDate, getIstDayEndMs, getIstDayStartMs, getNowMs, hasIstDayStarted, isWithinIstDayRange } from "@/utils/date.util";

export function validateFeedbackPayload({ title, batch, dateStart, dateEnd }) {
  if (!title || !batch || !dateStart || !dateEnd) {
    return "title, batch, dateStart and dateEnd are required.";
  }

  const start = createDate(dateStart);
  const end = createDate(dateEnd);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "dateStart and dateEnd must be valid dates.";
  }

  if (start > end) {
    return "dateStart cannot be later than dateEnd.";
  }

  return null;
}

export function buildCreateFeedbackPayload(payload) {
  return {
    title: payload.title,
    batch: payload.batch,
    dateStart: payload.dateStart,
    dateEnd: payload.dateEnd,
  };
}

export function sortFeedbacksByDateStartDesc(feedbacks = []) {
  return [...feedbacks]
    .filter((feedback) => hasIstDayStarted(feedback.dateStart))
    .sort((left, right) => {
      const leftIsActive = isWithinIstDayRange(left.dateEnd);
      const rightIsActive = isWithinIstDayRange(right.dateEnd);

      if (leftIsActive !== rightIsActive) {
        return leftIsActive ? -1 : 1;
      }

      return getIstDayStartMs(right.dateStart) - getIstDayStartMs(left.dateStart);
    });
}

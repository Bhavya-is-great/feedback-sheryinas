export function validateFeedbackPayload({ title, batch, dateStart, dateEnd }) {
  if (!title || !batch || !dateStart || !dateEnd) {
    return "title, batch, dateStart and dateEnd are required.";
  }

  const start = new Date(dateStart);
  const end = new Date(dateEnd);

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
  return [...feedbacks].sort(
    (left, right) =>
      new Date(right.dateStart).getTime() - new Date(left.dateStart).getTime()
  );
}

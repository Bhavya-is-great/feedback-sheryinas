export const IST_TIME_ZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 330 * 60 * 1000;

function normalizePart(parts, type) {
  return Number(parts.find((part) => part.type === type)?.value || 0);
}

export function createDate(value) {
  return value === undefined ? new Date() : new Date(value);
}

export function getNowMs() {
  return Date.now();
}

export function getNowDate() {
  return createDate();
}

export function getFutureDate(durationMs) {
  return createDate(getNowMs() + durationMs);
}

export function getEpochDate() {
  return createDate(0);
}

export function getTime(value) {
  return createDate(value).getTime();
}

export function isAfterNow(value) {
  return getTime(value) > getNowMs();
}

export function formatIstDate(value, options = {}) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  }).format(createDate(value));
}

function getIstDateParts(value) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: IST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(createDate(value));

  return {
    year: normalizePart(parts, "year"),
    month: normalizePart(parts, "month"),
    day: normalizePart(parts, "day"),
  };
}

function getIstDayTimestamp(value, hour, minute, second, millisecond) {
  const { year, month, day } = getIstDateParts(value);

  return Date.UTC(year, month - 1, day, hour, minute, second, millisecond) - IST_OFFSET_MS;
}

export function getIstDayStartMs(value) {
  return getIstDayTimestamp(value, 0, 0, 0, 0);
}

export function getIstDayEndMs(value) {
  return getIstDayTimestamp(value, 23, 59, 59, 999);
}

export function hasIstDayStarted(value) {
  return getIstDayStartMs(value) <= getNowMs();
}

export function isWithinIstDayRange(dateEnd) {
  return getIstDayEndMs(dateEnd) >= getNowMs();
}

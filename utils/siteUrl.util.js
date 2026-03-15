export function getSiteBaseUrl(fallback = "") {
  return (
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    fallback ||
    ""
  ).replace(/\/+$/, "");
}

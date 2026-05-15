/**
 * Map `/storage/...` (and absolute URLs pointing at it) to Laravel API route
 * `GET /api/public-storage/...` so files load through index.php and are not blocked
 * by Apache rules on the `/storage/` path.
 */
export function resolvePublicStorageUrl(url) {
  if (!url || typeof url !== "string") return url;

  function toApiUrl(pathname, search) {
    if (!pathname.startsWith("/storage/")) return null;
    const rel = pathname.slice("/storage/".length);
    if (!rel || rel.includes("..")) return null;
    const q = search && search !== "?" ? search : "";
    return `/api/public-storage/${rel}${q}`;
  }

  const trimmed = url.trim();

  if (trimmed.startsWith("/storage/")) {
    const qIndex = trimmed.indexOf("?");
    const pathname = qIndex === -1 ? trimmed : trimmed.slice(0, qIndex);
    const search = qIndex === -1 ? "" : trimmed.slice(qIndex);
    return toApiUrl(pathname, search) ?? trimmed;
  }

  try {
    const u = new URL(trimmed);
    const mapped = toApiUrl(u.pathname, u.search || "");
    if (mapped) return mapped;
  } catch {
    /* ignore */
  }

  return trimmed;
}

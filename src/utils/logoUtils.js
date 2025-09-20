// utils/logoUtils.js
export function getLogoSrc(logo) {
  if (!logo && logo !== 0) return "";

  let s = (typeof logo === "string" ? logo : JSON.stringify(logo)).trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);

  // Already a data URL
  if (s.startsWith("data:image/")) return s;

  // If someone btoa()’d a data URL, recover it
  try {
    const decoded = atob(s);
    if (decoded.startsWith("data:image/")) return decoded;
  } catch { /* not base64 of a data URL */ }

  // --- Base64 heuristics FIRST (handles /9j/... etc.) ---
  // common magic prefixes
  const isLikelyBase64 =
    s.startsWith("/9j/") ||       // JPEG
    s.startsWith("iVBOR") ||      // PNG
    s.startsWith("R0lGO") ||      // GIF
    s.startsWith("PHN2");         // SVG (base64)

  if (isLikelyBase64) {
    let mime = "image/jpeg";
    if (s.startsWith("iVBOR")) mime = "image/png";
    else if (s.startsWith("R0lGO")) mime = "image/gif";
    else if (s.startsWith("PHN2")) mime = "image/svg+xml";
    return `data:${mime};base64,${s}`;
  }

  // --- Only treat as URL/path AFTER ruling out base64 ---
  if (/^https?:\/\//.test(s)) return s;
  if (s.startsWith("/")) return s;

  // Fallback: treat as raw base64 jpeg
  return `data:image/jpeg;base64,${s}`;
}

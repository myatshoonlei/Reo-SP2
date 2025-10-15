// utils/logoUtils.js
export function getLogoSrc(logo) {
  if (!logo && logo !== 0) return "";

  let s = (typeof logo === "string" ? logo : JSON.stringify(logo)).trim();
  if (s.startsWith('"') && s.endsWith('"')) s = s.slice(1, -1);

  // ✅ Accept already-usable sources first
  if (s.startsWith("blob:")) return s;          // <-- add this
  if (s.startsWith("data:image/")) return s;
  if (/^https?:\/\//i.test(s)) return s;        // http/https handled early

  // If someone btoa()’d a data URL, recover it
  try {
    const decoded = atob(s);
    if (decoded.startsWith("data:image/")) return decoded;
  } catch { /* not base64 of a data URL */ }

  // Base64 heuristics
  const isLikelyBase64 =
    s.startsWith("/9j/") ||      // JPEG
    s.startsWith("iVBOR") ||     // PNG
    s.startsWith("R0lGO") ||     // GIF
    s.startsWith("PHN2");        // SVG

  if (isLikelyBase64) {
    let mime = "image/jpeg";
    if (s.startsWith("iVBOR")) mime = "image/png";
    else if (s.startsWith("R0lGO")) mime = "image/gif";
    else if (s.startsWith("PHN2")) mime = "image/svg+xml";
    return `data:${mime};base64,${s}`;
  }

  // Absolute path
  if (s.startsWith("/")) return s;

  // Fallback: treat as raw base64 jpeg
  return `data:image/jpeg;base64,${s}`;
}

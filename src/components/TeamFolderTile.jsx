// TeamFolderTile.jsx
import { Pencil, Share2, Trash2 } from "lucide-react";
import { getLogoSrc } from "../server/utils/logoUtils";

/* ----------------- color helpers ----------------- */
const clamp01 = (n) => Math.max(0, Math.min(1, n));

function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  const s = String(hex).trim().replace(/^#/, "");
  const v = s.length === 3
    ? s.split("").map((c) => c + c).join("")
    : s.padEnd(6, "0").slice(0, 6);
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}
function rgbToHex({ r, g, b }) {
  const to = (x) => x.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}
function mixHex(a, b, t) {
  const A = hexToRgb(a), B = hexToRgb(b);
  const m = (x, y) => Math.round(x * (1 - t) + y * t);
  return rgbToHex({ r: m(A.r, B.r), g: m(A.g, B.g), b: m(A.b, B.b) });
}
function relLum(hex) {
  const { r, g, b } = hexToRgb(hex);
  const c = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrastRatio(a, b) {
  const L1 = relLum(a), L2 = relLum(b);
  const hi = Math.max(L1, L2), lo = Math.min(L1, L2);
  return (hi + 0.05) / (lo + 0.05);
}
function textOn(bg) {
  // pick black/white for decent contrast on the given bg
  return contrastRatio(bg, "#111111") >= contrastRatio(bg, "#ffffff") ? "#111111" : "#ffffff";
}

/** If primary & secondary are too close, nudge secondary toward white/black. */
function ensureContrast(primary, secondary, target = 3.0, maxSteps = 12) {
  let s = secondary;
  if (contrastRatio(primary, s) >= target) return s;

  // try toward white first; if still bad, try toward black
  for (let step = 1; step <= maxSteps; step++) {
    const t = step / maxSteps; // 0 → 1
    const tryWhite = mixHex(s, "#ffffff", t);
    if (contrastRatio(primary, tryWhite) >= target) return tryWhite;
  }
  for (let step = 1; step <= maxSteps; step++) {
    const t = step / maxSteps;
    const tryBlack = mixHex(s, "#000000", t);
    if (contrastRatio(primary, tryBlack) >= target) return tryBlack;
  }
  return s; // fallback
}

/* ------- pastel fallback when DB colors missing ------- */
function deriveColors(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    primary: `hsl(${hue} 45% 70%)`,
    secondary: `hsl(${hue} 70% 93%)`,
  };
}

/**
 * Props:
 * - team, count, onOpen(teamid)
 * - onEdit?(team), onShare?(team), onDelete?(team)
 * - tileHeightClass (default h-[200px])
 */
export default function TeamFolderTile({
  team,
  count = 0,
  onOpen,
  onEdit,
  onShare,
  onDelete,
  tileHeightClass = "h-[200px]",
}) {
  const hasColors = !!team?.primary_color && !!team?.secondary_color;
  const base = hasColors ? { primary: team.primary_color, secondary: team.secondary_color }
                         : deriveColors(team?.company_name);

  // auto-fix bad combos
  const fixedSecondary = ensureContrast(base.primary, base.secondary, 3.0);
  const primary = base.primary;
  const secondary = fixedSecondary;

  // pick text color for content area (which sits over the secondary band)
  const textColor = textOn(secondary);

  const logoSrc = getLogoSrc(team?.logo);

  // ---- curve controls ----
  const BAND_PC = 36;  // header band height (0–100)
  const DIP_PC  = 16;  // smile depth (bigger = deeper)
  const d = `M0 0 H100 V${BAND_PC} Q50 ${BAND_PC + DIP_PC} 0 ${BAND_PC} Z`;
  const CONTENT_Y = BAND_PC + DIP_PC; // %
  // ------------------------

  const open = () => onOpen?.(team.teamid);
  const handleEdit = (e) => { e.stopPropagation(); onEdit?.(team); };
  const handleShare = (e) => { e.stopPropagation(); onShare?.(team); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete?.(team); };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={handleKeyDown}
      title={team.company_name}
      className={[
        "group relative isolate w-full rounded-2xl bg-white shadow-md hover:shadow-lg",
        "transition focus:outline-none focus:ring-2 focus:ring-blue-500",
        "overflow-hidden cursor-pointer",
        tileHeightClass,
      ].join(" ")}
    >
      {/* Body (secondary) */}
      <div className="absolute inset-0" style={{ background: secondary }} />

      {/* Header (primary) with smooth curve */}
      <svg
        className="absolute top-0 left-0 w-full"
        style={{ height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill={primary} d={d} />
      </svg>

      {/* Actions */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button onClick={handleEdit} type="button" className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors" aria-label="Edit team">
          <Pencil size={18} />
        </button>
        <button onClick={handleShare} type="button" className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors" aria-label="Share team">
          <Share2 size={18} />
        </button>
        <button onClick={handleDelete} type="button" className="p-2 rounded-full bg-red-500/60 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors" aria-label="Delete team">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Content on the curve center */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
        style={{ top: `${CONTENT_Y}%`, color: textColor }}
      >
        {/* Logo */}
        <div className="w-16 h-16 rounded-full ring-4 ring-white overflow-hidden shadow-md bg-white">
          {logoSrc ? (
            <img src={logoSrc} alt={`${team.company_name} logo`} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xl">📁</div>
          )}
        </div>

        {/* Name & count (use auto textColor) */}
        <div className="mt-2 text-lg font-semibold text-center whitespace-normal leading-tight max-w-[92%]">
          {team.company_name}
        </div>
        <div className="text-xs opacity-90">
          {count} {count === 1 ? "card" : "cards"}
        </div>
      </div>
    </div>
  );
}

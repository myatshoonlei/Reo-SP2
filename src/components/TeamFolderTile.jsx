// TeamFolderTile.jsx
import { Pencil, Share2, Trash2 } from "lucide-react";
import { getLogoSrc } from "../utils/logoUtils";

// Pastel fallback if DB colors are missing
function deriveColors(name = "") {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    primary: `hsl(${hue} 45% 70%)`,   // header
    secondary: `hsl(${hue} 70% 93%)`, // body
  };
}

/**
 * Props:
 * - team, count, onOpen(teamid)
 * - onEdit?(team), onShare?(team), onDelete?(team)  <-- optional, for now just UI hooks
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
  const { primary, secondary } = hasColors
    ? { primary: team.primary_color, secondary: team.secondary_color }
    : deriveColors(team?.company_name);

  const logoSrc = getLogoSrc(team?.logo);

  // ---- Curve controls ----
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
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
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
      {/* Body */}
      <div className="absolute inset-0" style={{ background: secondary }} />

      {/* Header with a smooth, symmetric smile */}
      <svg
        className="absolute top-0 left-0 w-full"
        style={{ height: "100%" }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path fill={primary} d={d} />
      </svg>

      {/* Action buttons (hover reveal) */}
      <div className="absolute top-3 right-3 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <button
          onClick={handleEdit}
          type="button"
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Edit team"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={handleShare}
          type="button"
          className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
          aria-label="Share team"
        >
          <Share2 size={18} />
        </button>
        <button
          onClick={handleDelete}
          type="button"
          className="p-2 rounded-full bg-red-500/60 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors"
          aria-label="Delete team"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Content pinned ON the curve center */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center"
        style={{ top: `${CONTENT_Y}%` }}
      >
        {/* Logo */}
        <div className="w-16 h-16 rounded-full ring-4 ring-white overflow-hidden shadow-md">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt={`${team.company_name} logo`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-[#0b2447] text-white flex items-center justify-center text-xl">
              📁
            </div>
          )}
        </div>

        {/* Name (wrap, no truncation) */}
        <div className="mt-2 text-lg font-semibold text-[#0b2447] text-center whitespace-normal leading-tight max-w-[92%]">
          {team.company_name}
        </div>

        <div className="text-xs text-gray-600">
          {count} {count === 1 ? "card" : "cards"}
        </div>
      </div>
    </div>
  );
}

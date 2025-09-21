// src/components/templates/Template1.jsx
import { getLogoSrc } from "../../utils/logoUtils";

/**
 * Unified Template1
 * - accepts snake_case (primary) and camelCase (fallback) props
 * - robust logo handling with dataURL prefix + onError fallback
 * - optional QR block (with_qr_code)
 * - uses secondary_color for background and primary_color for foreground accents
 * - graceful defaults so it renders even with partial data
 */
const Template1 = (rawProps) => {
  // normalize props (prefer snake_case; fall back to camelCase)
  const fullname        = rawProps.fullname        ?? rawProps.fullName        ?? "Name";
  const email           = rawProps.email           ?? "email@example.com";
  const company_name    = rawProps.company_name    ?? rawProps.companyName     ?? "Company";
  const job_title       = rawProps.job_title       ?? rawProps.jobTitle        ?? "Title";
  const phone_number    = rawProps.phone_number    ?? rawProps.phoneNumber     ?? "123-456-7890";
  const company_address = rawProps.company_address ?? rawProps.companyAddress  ?? "";
  // colors (bg = secondary, fg = primary)
  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#ffffff");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#0b0b0b");

  // logo
  const logo            = getLogoSrc(rawProps.logo) || rawProps.logoUrl || "/placeholder.svg";

  const side            = rawProps.side ?? "front";
  const qr              = rawProps.qr ?? null;
  const backShow        = rawProps.backShow ?? {};

  const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  if (side === "back") {
    // -------------- BACK SIDE (No changes) --------------
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 font-inter flex items-center justify-between"
        style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: 'Poppins, sans-serif' }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          {show.qr &&
            (qr ? (
              <img
                src={qr}
                alt="QR"
                className="w-14 h-14 rounded bg-white p-1"
                style={{ border: `2px solid ${primary_color}` }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded bg-white/60 flex items-center justify-center text-[10px]"
                style={{ border: `1px dashed ${primary_color}` }}
              >
                QR
              </div>
            ))}
          {show.companyName && (
            <span className="mt-2 font-semibold text-center">
              {company_name || "Company"}
            </span>
          )}
        </div>
      </div>
    );
  }

  // -------------- FRONT SIDE (New Innovative Design) --------------
  return (
    <div
      className="relative w-full h-[200px] rounded-xl border shadow-lg p-5 flex flex-col justify-between font-sans overflow-hidden hover:shadow-xl transition-all duration-300"
      style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Innovative Background Shapes */}
      <div
        className="absolute w-48 h-48 rounded-full opacity-20 -top-10 -right-16"
        style={{ backgroundColor: primary_color }}
      ></div>
      <div
        className="absolute w-32 h-32 rounded-full opacity-10 -bottom-16 -left-10"
        style={{ backgroundColor: primary_color }}
      ></div>

      {/* Main content container ensures it's above the shapes */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Top Section: Logo & Name */}
        <div className="flex justify-between items-start">
          {/* Logo in a "Glass" Frame */}
          <div
            className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
            style={{ border: `2px solid ${primary_color}` }}
          >
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              className="w-14 h-14 object-contain"
            />
          </div>

          {/* Name and Job Title */}
          <div className="text-right flex flex-col items-end">
            <h2 className="font-extrabold text-xl leading-tight">
              {fullname || "Full Name"}
            </h2>
            <p className="text-md font-medium opacity-80 mt-1">
              {job_title || "Job Title"}
            </p>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="text-sm leading-6 space-y-1">
          <p className="font-bold">{company_name || "Company Name"}</p>
          <p className="opacity-90">{email || "email@example.com"}</p>
          <p className="opacity-90">
            {phone_number || "+1 (555) 123-4567"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Template1;

/* ---------------- helpers ---------------- */

function cleanupColor(color) {
  if (!color) return "#000000";
  // strip any accidental quotes from DB
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
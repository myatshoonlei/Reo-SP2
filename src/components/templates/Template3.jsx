// src/components/templates/Template3.jsx
import { getLogoSrc } from "../../utils/logoUtils";

const Template3 = (rawProps) => {
  // normalize props
  const fullname        = rawProps.fullname ?? rawProps.fullName ?? "Name";
  const email           = rawProps.email ?? "email@example.com";
  const phone_number    = rawProps.phone_number ?? rawProps.phoneNumber ?? "123-456-7890";
  const job_title       = rawProps.job_title ?? rawProps.jobTitle ?? "Title";
  const company_name    = rawProps.company_name ?? rawProps.companyName ?? "Company";
  const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "";

  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#0B2447");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#19A7CE");

  const logoSrc         = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

  const side            = rawProps.side ?? "front";
  const qr              = rawProps.qr ?? null;
  const backShow        = rawProps.backShow ?? {};

  const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  /* -------------------- BACK SIDE -------------------- */
  if (side === "back") {
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 font-inter flex items-center justify-center"
        style={{ backgroundColor: secondary_color, color: primary_color }}
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
              {company_name}
            </span>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- FRONT SIDE (Glassmorphism) -------------------- */
  return (
    <div className="relative w-full h-[200px] rounded-xl shadow-lg font-sans overflow-hidden hover:shadow-xl transition-all duration-300 text-white">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${primary_color} 0%, ${secondary_color} 100%)`,
        }}
      />

      {/* Frosted glass panel */}
      <div className="absolute inset-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col justify-between">
        {/* Top: Logo + Name/Title */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-lg truncate" title={fullname}>
              {fullname}
            </h3>
            <p className="text-sm opacity-90 truncate" title={job_title}>
              {job_title}
            </p>
            <p className="text-xs opacity-75 truncate mt-1" title={company_name}>
              {company_name}
            </p>
          </div>

          <img
            src={logoSrc}
            alt="Logo"
            className="w-12 h-12 rounded object-cover bg-white/20 p-1"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>

        {/* Bottom: Company / Contact */}
        <div className="space-y-1">
          <div className="border-t border-white/20 my-2" />
          <div className="flex justify-between text-xs opacity-90 gap-2">
            <span className="truncate" title={company_address}>
              {company_address || "123 Main Street, Anytown"}
            </span>
            <div className="flex flex-col items-end min-w-0">
              <span className="truncate" title={phone_number}>
                {phone_number}
              </span>
              <span className="truncate" title={email}>
                {email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template3;

/* ---------- helpers ---------- */
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
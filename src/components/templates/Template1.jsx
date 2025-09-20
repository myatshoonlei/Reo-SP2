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
  const with_qr_code    = rawProps.with_qr_code    ?? rawProps.withQRCode      ?? false;

  // colors (bg = secondary, fg = primary)
  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#ffffff");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#0b0b0b");

  // logo
  const logoSrc = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

  return (
    <div
      className="w-full h-[200px] rounded-xl border shadow-md p-4 flex flex-col justify-between font-inter hover:shadow-lg transition-all"
      style={{ backgroundColor: secondary_color, color: primary_color }}
    >
      {/* Top Row: Logo & Name */}
      <div className="flex justify-between items-center">
        <img
          src={logoSrc}
          alt="Logo"
          className="w-12 h-12 object-contain rounded"
          onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
        />
        <div className="text-right">
          <h2 className="font-bold text-lg truncate" title={fullname}>{fullname}</h2>
          <p className="text-sm opacity-90 truncate" title={job_title}>{job_title}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t my-2" style={{ borderColor: primary_color, opacity: 0.25 }} />

      {/* Info Section */}
      <div className="text-sm leading-5 space-y-1">
        <p className="font-semibold truncate" title={company_name}>{company_name}</p>
        <p className="truncate" title={email}>{email}</p>
        <p className="truncate" title={phone_number}>{phone_number}</p>
      </div>

      {/* Optional QR (kept from your first version) */}
      {with_qr_code && (
        <div
          className="w-1/3 flex flex-col items-center justify-center border-l pl-3 ml-3 self-end"
          style={{ borderColor: primary_color, opacity: 0.35 }}
        >
          <svg className="w-16 h-16" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="256" height="256" rx="12" fill="white"/>
            <path d="M76 76H36V36H76V76ZM64 48H48V64H64V48Z" fill={primary_color}/>
            <path d="M36 180H76V220H36V180ZM48 192V208H64V192H48Z" fill={primary_color}/>
            <path d="M180 76H220V36H180V76ZM192 48H208V64H192V48Z" fill={primary_color}/>
            <path d="M108 108H148V148H108V108ZM120 120V136H136V120H120Z" fill={primary_color}/>
          </svg>
          <p className="text-xs mt-1 text-center" style={{ color: primary_color, opacity: 0.8 }}>
            Scan Me
          </p>
        </div>
      )}
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
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

  const logo         = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

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
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg font-sans overflow-hidden hover:shadow-xl transition-all duration-300 text-white"
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${primary_color} 0%, ${secondary_color} 100%)`,
        }}
      />

      {/* Frosted Glass Panel */}
      <div className="absolute inset-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 p-4 flex flex-col justify-between">

        {/* Top Section: Logo, Company, Title */}
        <div className="flex items-center space-x-3">
          {logo && (
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
            />
          )}
          <div>
            <p className=" text-xl font-bold">{fullname || "Ben10"}</p>
            <p className="text-sm opacity-70">{job_title || "Job Title"}</p>
          </div>
        </div>

        {/* Bottom Section: Name & Contact */}
        <div>
          
          <div className="border-t border-white/20 my-2"></div>

          <div className="flex justify-between text-xs opacity-80">
            {/* Left side (Email) */}
            <span>{company_address || "123 Main Street, Anytown"}</span>
            

            {/* Right side (Phone + Address stacked) */}
            <div className="flex flex-col items-end">
              
              <span>{phone_number || "+1 (555) 123-4567"}</span>
              <span>{email || "email@example.com"}</span>
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
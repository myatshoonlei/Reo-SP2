// src/components/templates/Template2.jsx
import { Phone, Mail, MapPin } from "lucide-react";
import { getLogoSrc } from "../../utils/logoUtils";

const Template2 = (rawProps) => {
  // normalize props
  const fullname        = rawProps.fullname ?? rawProps.fullName ?? "Name";
  const email           = rawProps.email ?? "email@example.com";
  const company_name    = rawProps.company_name ?? rawProps.companyName ?? "Company";
  const job_title       = rawProps.job_title ?? rawProps.jobTitle ?? "Title";
  const phone_number    = rawProps.phone_number ?? rawProps.phoneNumber ?? "123-456-7890";
  const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "";

  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#0b2447");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#ffffff");

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

  // ---- FRONT SIDE ----
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg flex font-sans overflow-hidden"
      style={{ backgroundColor: secondary_color, color: primary_color }}
    >
      {/* Background Shapes - Retained from your preferred version */}
      <div
        className="absolute inset-0 z-0"
        style={{ backgroundColor: secondary_color }}
      ></div>
      <div
        className="absolute top-0 left-0 w-1/2 h-full transform -skew-x-12 origin-top-left"
        style={{ backgroundColor: primary_color, left: '-25%' }}
      ></div>
      <div
        className="absolute top-0 left-0 w-1/3 h-full transform -skew-x-12 origin-top-left"
        style={{ backgroundColor: primary_color, opacity: 0.8, left: '-15%' }}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-full opacity-10"
        style={{ backgroundColor: primary_color }}
      ></div>

      {/* Left Section: Company Logo - Width reduced */}
      <div
        className="relative z-15 w-1/3 flex flex-col items-center justify-center p-5 text-white"
        style={{ backgroundColor: primary_color }}
      >
        {logo && (
        <img
            src={logo || "/placeholder.svg"}
            alt="Logo"
            className="w-12 h-12 rounded-full object-cover border-2 border-white/50"
          />
        )}
      </div>

      {/* Right Section: Personal Details - Width increased */}
      <div
        className="relative z-10 w-2/3 p-4 flex flex-col justify-center"
        style={{ color: primary_color }}
      >
        <h3 className="text-2xl font-bold uppercase leading-tight">{fullname || "FULL NAME"}</h3>
        <p className="text-sm font-medium opacity-80 mb-4">{job_title || "Job Title"}</p>

        <div className="space-y-2 text-sm mt-auto">
          <div className="flex items-center gap-2">
            <Phone size={16} />
            <span>{phone_number || "+1 (555) 123-4567"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={16} />
            <span>{email || "email@example.com"}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span className='truncate'>{company_address || "123 Main Street, Anytown"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template2;

/* --- helpers --- */
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
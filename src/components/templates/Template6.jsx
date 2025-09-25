// Template6.jsx (Revised)
import { getLogoSrc } from "../../utils/logoUtils";

const Template6 = (rawProps) => {
 const fullname = rawProps.fullname ?? rawProps.fullName ?? "Your Name";
   const email = rawProps.email ?? "email@example.com";
   const phone_number = rawProps.phone_number ?? rawProps.phoneNumber ?? "+1 (555) 123-4567";
   const job_title = rawProps.job_title ?? rawProps.jobTitle ?? "Job Title";
   const company_name = rawProps.company_name ?? rawProps.companyName ?? "Company Name";
   const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "";
 
   // Handle colors with a cleanup utility
   const primary_color = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#0B2447");
   const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#576CBC");
 
   // Handle logo with a utility function and a placeholder fallback
   const logo = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";
 
   // Handle component state props
   const side = rawProps.side ?? "front";
   const qr = rawProps.qr ?? null;
   const backShow = rawProps.backShow ?? {};

    const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  // For dark mode, ensure secondary color is dark, or default to a dark gray
  const bgColor = secondary_color || '#1a202c'; 
  const accentColor = primary_color || '#00bcd4'; // Default to a cyan for tech feel

  if (side === "back") {
    // -------------- BACK SIDE (Consistent but adapted for dark mode) --------------
    return (
      <div
        className="w-full h-[200px] rounded-xl border border-gray-700 shadow-md p-4 font-inter flex items-center justify-between"
        style={{ backgroundColor: bgColor, color: accentColor }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          {show.qr &&
            (qr ? (
              <img
                src={qr}
                alt="QR"
                className="w-14 h-14 rounded bg-white p-1"
                style={{ border: `2px solid ${accentColor}` }}
              />
            ) : (
              <div
                className="w-14 h-14 rounded bg-white/20 flex items-center justify-center text-[10px]"
                style={{ border: `1px dashed ${accentColor}`, color: '#FFF' }}
              >
                QR
              </div>
            ))}
          {show.companyName && (
            <span className="mt-2 font-semibold text-center text-white">
              {company_name || "Company"}
            </span>
          )}
        </div>
      </div>
    );
  }

  // -------------- FRONT SIDE (Neo-Tech Grid) --------------
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg font-sans text-white overflow-hidden transition-all duration-300 hover:shadow-2xl"
      style={{ backgroundColor: bgColor }}
    >
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 bg-repeat opacity-5"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Dynamic Angular Accent */}
      <div
        className="absolute top-0 right-0 w-3/5 h-full transform skew-x-[-15deg] origin-top-right"
        style={{ background: `linear-gradient(90deg, transparent 0%, ${accentColor} 80%)`, opacity: 0.2 }}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-3/5 h-full transform skew-x-[-15deg] origin-bottom-left"
        style={{ background: `linear-gradient(90deg, ${accentColor} 0%, transparent 80%)`, opacity: 0.2 }}
      ></div>

      {/* Main Content Area */}
      <div className="relative z-10 flex h-full p-4">
        {/* Left Section: Logo & Company Name */}
        <div className="w-2/5 flex flex-col justify-center items-start pr-4">
        {logo && (
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo"
            className="w-14 h-14 rounded-full object-cover p-1 mb-2"
            style={{ border: `2px solid ${accentColor}` }}
          />
        )}
          <span className="font-bold text-lg leading-tight" style={{ color: accentColor }}>
            {company_name || "Tech Solutions"}
          </span>
        </div>

        {/* Right Section: Name, Title & Contact */}
        <div className="w-3/5 flex flex-col justify-center pl-4 border-l border-gray-700">
          <h2 className="text-2xl font-bold mb-1" style={{ color: accentColor }}>
            {fullname || "Sarah Connor"}
          </h2>
          <p className="text-md opacity-80 mb-3">{job_title || "Lead Developer"}</p>
          
          <div className="text-xs space-y-1 opacity-90">
            <p className="flex items-center" style={{ color: primary_color}}>
               {email || "sarah@tech.com"}
            </p>
            <p className="flex items-center" style={{ color: primary_color}}>
               {phone_number || "+1 (555) 987-6543"}
            </p>
            <p className="flex items-center" style={{ color: primary_color}}>
               {company_address || "456 Cyber St, Neo City"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template6;

/* ---------- helpers ---------- */
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
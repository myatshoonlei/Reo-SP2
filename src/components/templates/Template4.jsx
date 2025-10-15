import { getLogoSrc } from "../../server/utils/logoUtils";

// Function to clean up color strings
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}

const Template4 = (rawProps) => {
  // Normalize props from rawProps, preferring snake_case and falling back to camelCase
  const fullname        = rawProps.fullname ?? rawProps.fullName ?? "Your Name";
  const email           = rawProps.email ?? "email@example.com";
  const phone_number    = rawProps.phone_number ?? rawProps.phoneNumber ?? "+1 (555) 123-4567";
  const job_title       = rawProps.job_title ?? rawProps.jobTitle ?? "Job Title";
  const company_name    = rawProps.company_name ?? rawProps.companyName ?? "Company Name";
  const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "";

  // Handle colors with a cleanup utility
  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#FFFFFF");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#1F2937");

  // Handle logo with a utility function and a placeholder fallback
  const logo            = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

  // Handle component state props
  const side            = rawProps.side ?? "front";
  const qr              = rawProps.qr ?? null;
  const backShow        = rawProps.backShow ?? {};

  // Font family handling
  const font_family     = rawProps.font_family ?? rawProps.fontFamily ?? `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`;

  const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  /* -------------------- BACK SIDE -------------------- */
  if (side === "back") {
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 flex items-center justify-between"
        style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: font_family }}
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
            <span className="mt-2 font-semibold text-center" style={{ fontFamily: font_family }}>
              {company_name}
            </span>
          )}
        </div>
      </div>
    );
  }

  /* -------------------- FRONT SIDE (Geometric Overlay) -------------------- */
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: font_family }}
    >
      {/* Background Geometric Shape */}
      <div
        className="absolute -top-10 -right-16 w-48 h-48 transform rotate-45 opacity-20"
        style={{ backgroundColor: primary_color }}
      ></div>
      <div
        className="absolute -bottom-16 -left-10 w-40 h-40 rounded-full opacity-10"
        style={{ backgroundColor: primary_color }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-4">
        {/* Top: Company and Logo */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="w-10 h-10 rounded-full object-cover p-1"
            style={{ backgroundColor: primary_color }}
          />
          <span className="font-semibold" style={{ fontFamily: font_family }}>
            {company_name}
          </span>
        </div>

        {/* Middle: Name and Title */}
        <div className="text-right">
          <h2 className="text-3xl font-bold" style={{ fontFamily: font_family }}>
            {fullname}
          </h2>
          <p className="text-lg opacity-80" style={{ fontFamily: font_family }}>
            {job_title}
          </p>
        </div>

        {/* Bottom: Contact Info */}
        <div className="text-xs flex justify-between items-center opacity-90">
          <span>{company_address}</span>
          <div className="flex flex-col items-end">
            <span>{phone_number}</span>
            <span>{email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template4;
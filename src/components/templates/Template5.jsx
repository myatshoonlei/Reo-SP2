import { getLogoSrc } from "../../utils/logoUtils";

const Template5 = (rawProps) => {
  // Normalize props from rawProps, preferring snake_case and falling back to camelCase
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

  if (side === "back") {
    // -------------- BACK SIDE (Consistent) --------------
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 font-inter flex items-center justify-between"
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

  // -------------- FRONT SIDE (Gradient Wave) --------------
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg font-sans overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{ backgroundColor: secondary_color }}
    >
      {/* Gradient Wave Shape */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: `linear-gradient(60deg, ${primary_color} 0%, ${secondary_color} 100%)`,
          clipPath: 'ellipse(100% 70% at 0% 100%)',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-5 text-white">
        {/* Top: Name and Title */}
        <div className="text-right">
          <h2 className="text-2xl font-bold">{fullname}</h2>
          <p className="text-md opacity-80">{job_title}</p>
        </div>

        {/* Bottom: Logo and Contact */}
        <div className="flex justify-between items-end">
          <div className="flex items-center space-x-3">
            {logo && (
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover bg-white/30 p-1"
            />
            )}
            <span className="font-bold">{company_name}</span>
          </div>
          <div className="text-right text-xs opacity-90">
            <p>{email}</p>
            <p>{phone_number}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5;

/* ---------- helpers ---------- */
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
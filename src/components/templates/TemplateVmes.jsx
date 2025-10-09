import { getLogoSrc } from "../../utils/logoUtils";

const TemplateVmes = (rawProps) => {
  const fullname = rawProps.fullname ?? rawProps.fullName ?? "FULL NAME";
  const email = rawProps.email ?? "email@example.com";
  const phone_number = rawProps.phone_number ?? rawProps.phoneNumber ?? "+1 (555) 123-4567";
  const job_title = rawProps.job_title ?? rawProps.jobTitle ?? "Position";
  const company_name = rawProps.company_name ?? rawProps.companyName ?? "Company Name";
  const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "Bang Na Trad Rd., Km.26 Bang Seo Thong, Samut Prakan 10570";

  // Colors
  const primary_color = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#0B3B8C");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#FFFFFF");

  // Logo
  const logo = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

  // View state
  const side = rawProps.side ?? "front";
  const qr = rawProps.qr ?? null;

  // Helper function to split long job titles and addresses
  const formatText = (text, maxLength = 25) => {
    if (!text) return [""];
    const lines = [];
    let currentLine = "";
    text.split(" ").forEach(word => {
      if ((currentLine + word).length > maxLength && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine += word + " ";
      }
    });
    lines.push(currentLine.trim());
    return lines;
  };

  const jobTitleLines = formatText(job_title, 55); // Adjusting max length for job title
  const addressLines = formatText(company_address, 25); // Adjusting max length for address

  if (side === "back") {
    // Back: put QR centered
    return (
      <div
        className="relative w-full h-[200px] rounded-xl shadow-md border border-gray-200 overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: secondary_color }}
      >
        {qr ? (
          <img
            src={qr}
            alt="QR"
            className="w-24 h-24 bg-white p-2 rounded-md shadow"
            style={{ border: `2px solid ${primary_color}` }}
          />
        ) : (
          <div
            className="w-24 h-24 rounded-md flex items-center justify-center text-xs"
            style={{ color: primary_color, border: `1.5px dashed ${primary_color}` }}
          >
            QR
          </div>
        )}
        <div className="absolute bottom-3 text-center w-full px-4">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: primary_color }}
          >
            {company_name}
          </p>
        </div>
      </div>
    );
  }

  // Front: Exact match to reference image
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg overflow-hidden font-sans"
      style={{ backgroundColor: secondary_color }}
    >
      {/* Left panel with curved edge like ")" */}
      <div
        className="absolute inset-y-0 left-0 flex flex-col items-center justify-center py-4"
        style={{
          backgroundColor: primary_color,
          width: '35%',
          borderTopRightRadius: '100px',
          borderBottomRightRadius: '100px'
        }}
      >
        {/* Logo container */}
        <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-md" style={{ zIndex: 10 }}>
          {logo && logo !== "/placeholder.svg" ? (
            <img
              src={logo}
              alt="Logo"
              className="w-full h-full object-contain p-2"
              crossOrigin="anonymous"
              loading="eager"
              onError={(e) => {
                console.error('Logo failed to load:', logo);
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-xs font-medium"
              style={{ color: primary_color }}
            >
              LOGO
            </div>
          )}
        </div>
        {/* Company Name */}
        <p className="mt-2 px-2 text-center text-xs font-semibold" style={{ color: secondary_color }}>
          {company_name}
        </p>
      </div>

      {/* Right content area */}
      <div className="absolute inset-y-0 flex flex-col justify-between py-5 px-4" style={{ left: '35%', right: '0%' }}>
        {/* Top section: Name and Position */}
        <div className="flex flex-col">
          <h1
            className="text-l font-bold leading-tight mb-1 tracking-wide uppercase"
            style={{ color: primary_color }}
          >
            {fullname}
          </h1>
          <p
            className="text-xs text-basefont-small"
            style={{ color: primary_color, opacity: 0.8 }}
          >
            {jobTitleLines.map((line, index) => (
              <span key={index} className="block">{line}</span>
            ))}
          </p>
        </div>

        {/* Bottom section: Contact Information with icons */}
        <div className="space-y-1">
          <ContactRow
            icon={<PhoneIcon color={primary_color} />}
            color={primary_color}
            text={phone_number}
          />
          <ContactRow
            icon={<MailIcon color={primary_color} />}
            color={primary_color}
            text={email}
          />
          <div className="flex items-start text-sm" style={{ color: primary_color }}>
            <PinIcon color={primary_color} />
            <div className="leading-tight">
              {addressLines.map((line, index) => (
                <span key={index} className="block">{line}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Subtle border */}
      <div className="absolute inset-0 rounded-xl pointer-events-none border border-gray-100" />
    </div>
  );
};

export default TemplateVmes;

/* ----------------- Helper Functions ----------------- */
function cleanupColor(color) {
  if (!color) return "#000000";
  return String(color).replace(/^['"]+|['"]+$/g, "");
}

/* ----------------- Icon Components - Circular with borders like reference ----------------- */
function PhoneIcon({ color = "#0B3B8C" }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border"
      style={{ borderColor: color }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path
          d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.11 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72c.12.89.31 1.76.57 2.6a2 2 0 0 1-.45 2.11L9 10a16 16 0 0 0 5 5l.57-1.22a2 2 0 0 1 2.11-.45c.84.26 1.71.45 2.6.57A2 2 0 0 1 22 16.92z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function MailIcon({ color = "#0B3B8C" }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border"
      style={{ borderColor: color }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 4h16v16H4z"
          stroke={color}
          strokeWidth="1.5"
        />
        <path
          d="M22 6l-10 7L2 6"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function PinIcon({ color = "#0B3B8C" }) {
  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 border mt-0.5"
      style={{ borderColor: color }}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 21s-6-5.33-6-10a6 6 0 1 1 12 0c0 4.67-6 10-6 10z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="12"
          cy="11"
          r="2"
          stroke={color}
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function ContactRow({ icon, text, color }) {
  return (
    <div className="flex items-center text-sm" style={{ color }}>
      {icon}
      <span className="leading-tight">{text}</span>
    </div>
  );
}
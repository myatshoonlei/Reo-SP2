import { useLayoutEffect, useRef, useState } from "react";
import { getLogoSrc } from "../../utils/logoUtils";

const FALLBACK_STACK =
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`;

/* ---------- helpers ---------- */
function cleanupColor(color, fallback = "#000000") {
  if (!color) return fallback;
  return String(color).replace(/^['"]+|['"]+$/g, "");
}
function toPx(v, fallback) {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/* ---------- auto-fit text ---------- */
function SmartText({
  children,
  desired,
  defaultStart = 14,
  min = 9,
  step = 1,
  allowWrap = false,
  className = "",
  style = {},
  recalcKey,
}) {
  const ref = useRef(null);
  const [size, setSize] = useState(desired ?? defaultStart);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let current = desired ?? defaultStart;
    el.style.fontSize = `${current}px`;

    const fits = () =>
      allowWrap ? el.scrollHeight <= el.clientHeight : el.scrollWidth <= el.clientWidth;

    let guard = 160;
    while (guard-- && current >= min) {
      if (fits()) break;
      current -= step;
      el.style.fontSize = `${current}px`;
    }
    setSize(Math.max(min, current));
  }, [children, desired, defaultStart, min, step, allowWrap, recalcKey]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        fontSize: `${size}px`,
        overflow: "hidden",
        whiteSpace: allowWrap ? "normal" : "nowrap",
      }}
    >
      {children}
    </div>
  );
}

/* ---------- template ---------- */
const Template5 = (rawProps) => {
  // normalized fields
  const fullname        = rawProps.fullname ?? rawProps.fullName ?? "Your Name";
  const email           = rawProps.email ?? "email@example.com";
  const phone_number    = rawProps.phone_number ?? rawProps.phoneNumber ?? "+1 (555) 123-4567";
  const job_title       = rawProps.job_title ?? rawProps.jobTitle ?? "Job Title";
  const company_name    = rawProps.company_name ?? rawProps.companyName ?? "Company Name";
  const company_address = rawProps.company_address ?? rawProps.companyAddress ?? "";

  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#0B2447");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#576CBC");

  const font_family     = rawProps.font_family ?? rawProps.fontFamily ?? FALLBACK_STACK;
  const logo            = getLogoSrc(rawProps.logo ?? rawProps.logoUrl) || "/placeholder.svg";

  const side            = rawProps.side ?? "front";
  const qr              = rawProps.qr ?? null;
  const backShow        = rawProps.backShow ?? {};

  // sizes
  const sizeName     = toPx(rawProps.size_name ?? rawProps.sizeName, 24);
  const sizeTitle    = toPx(rawProps.size_title ?? rawProps.sizeTitle, 16);
  const sizeCompany  = toPx(rawProps.size_company ?? rawProps.sizeCompany, 16);
  const sizeContact  = toPx(rawProps.size_contact ?? rawProps.sizeContact, 12);
  const sizeAddress  = toPx(rawProps.size_address ?? rawProps.sizeAddress, 12);

  const minName      = toPx(rawProps.min_name ?? rawProps.minName, 16);
  const minTitle     = toPx(rawProps.min_title ?? rawProps.minTitle, 12);
  const minCompany   = toPx(rawProps.min_company ?? rawProps.minCompany, 12);
  const minContact   = toPx(rawProps.min_contact ?? rawProps.minContact, 12);
  const minAddress   = toPx(rawProps.min_address ?? rawProps.minAddress, 12);

  const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  /* ---------- back ---------- */
  if (side === "back") {
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 flex items-center justify-between"
        style={{
          backgroundColor: secondary_color,
          color: primary_color,              // text = primary
          fontFamily: font_family,
          borderColor: primary_color,
        }}
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

  /* ---------- front (gradient wave) ---------- */
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{
        backgroundColor: secondary_color,
        fontFamily: font_family,            // ✅ use the real variable
        color: primary_color,               // ✅ text = primary color
      }}
    >
      {/* gradient wave */}
      <div
        className="absolute top-0 left-0 w-full h-full"
        style={{
          background: `linear-gradient(60deg, ${primary_color} 0%, ${secondary_color} 100%)`,
          clipPath: "ellipse(100% 70% at 0% 100%)",
        }}
      />

      {/* content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-5">
        {/* name/title */}
        <div className="text-right mb-2">
          <SmartText desired={sizeName}  min={minName}  recalcKey={font_family} className="font-bold leading-tight">
            {fullname}
          </SmartText>
          <SmartText desired={sizeTitle} min={minTitle} recalcKey={font_family} className="opacity-90">
            {job_title}
          </SmartText>
        </div>

        {/* bottom row */}
        <div className="flex justify-between items-start mt-2">
          {/* logo + company */}
          <div className="flex items-center space-x-3 mt-1">
            <img
              src={logo}
              alt="Logo"
              className="w-12 h-12 rounded-full object-cover bg-white p-1"
              style={{ border: `2px solid ${primary_color}` }}
            />
            <SmartText desired={sizeCompany} min={minCompany} recalcKey={font_family} className="font-bold">
              {company_name}
            </SmartText>
          </div>

          {/* contact */}
          <div className="text-right text-xs flex flex-col items-end space-y-1">
            <SmartText desired={sizeAddress} min={minAddress} allowWrap recalcKey={font_family} className="leading-snug opacity-90 max-w-[50%]">
              {email}
            </SmartText>
            <SmartText desired={sizeContact} min={minContact} recalcKey={font_family}>
              {phone_number}
            </SmartText>
            <SmartText desired={sizeContact} min={minContact} allowWrap recalcKey={font_family} className="opacity-90">
              {company_address || ""}
            </SmartText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Template5;
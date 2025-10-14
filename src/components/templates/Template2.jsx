// src/components/templates/Template2.jsx
import { useLayoutEffect, useRef, useState } from "react";
import { getLogoSrc } from "../../utils/logoUtils";

const FALLBACK_STACK =
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`;

function cleanupColor(c) {
  if (!c) return "#000000";
  return String(c).replace(/^['"]+|['"]+$/g, "");
}

/**
 * SmartText (same behavior as Template1)
 * - desired: starting px size; min: smallest px; autoFit shrinks until fits
 * - allowWrap = true → fit by height (multiline); otherwise single-line width fit
 */
function SmartText({
  children,
  desired,
  defaultStart = 14,
  min = 12, // Increased minimum font size to 12px
  step = 1,
  autoFit = true,
  allowWrap = false,
  className = "",
  style = {},
  titleOnHover = false,
  recalcKey,
}) {
  const ref = useRef(null);
  const [size, setSize] = useState(desired ?? defaultStart);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    let current = desired ?? defaultStart;
    el.style.fontSize = `${current}px`;

    if (!autoFit) {
      setSize(current);
      return;
    }

    const fits = () =>
      allowWrap ? el.scrollHeight <= el.clientHeight : el.scrollWidth <= el.clientWidth;

    let guard = 160;
    while (guard-- && current >= min) {
      if (fits()) break;
      current -= step;
      el.style.fontSize = `${current}px`;
    }
    setSize(Math.max(min, current)); // Ensuring text never goes below min size
  }, [children, desired, defaultStart, min, step, autoFit, allowWrap, recalcKey]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        fontSize: `${size}px`,
        overflow: "hidden",
        whiteSpace: allowWrap ? "normal" : "nowrap",
        textOverflow: "clip", // no ellipsis
      }}
      title={titleOnHover && typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}


const Template2 = (rawProps) => {
  // -------- Data (snake first; camel fallback) --------
  const fullname        = rawProps.fullname        ?? rawProps.fullName        ?? "Name";
  const email           = rawProps.email           ?? "email@example.com";
  const company_name    = rawProps.company_name    ?? rawProps.companyName     ?? "Company";
  const job_title       = rawProps.job_title       ?? rawProps.jobTitle        ?? "Title";
  const phone_number    = rawProps.phone_number    ?? rawProps.phoneNumber     ?? "123-456-7890";
  const company_address = rawProps.company_address ?? rawProps.companyAddress  ?? "";

  // Colors
  const primary_color   = cleanupColor(rawProps.primary_color   ?? rawProps.primaryColor   ?? "#0b2447");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#ffffff");

  // Font family
  const font_family     = rawProps.font_family ?? rawProps.fontFamily ?? FALLBACK_STACK;

  // Sizes (px)
  const sizeName        = toPx(rawProps.size_name    ?? rawProps.sizeName,    22);
  const sizeTitle       = toPx(rawProps.size_title   ?? rawProps.sizeTitle,   16);
  const sizeCompany     = toPx(rawProps.size_company ?? rawProps.sizeCompany, 15);
  const sizeEmail       = toPx(rawProps.size_email   ?? rawProps.sizeEmail,   14);
  const sizePhone       = toPx(rawProps.size_phone   ?? rawProps.sizePhone,   14);
  const sizeAddress     = toPx(rawProps.size_address ?? rawProps.sizeAddress, 12);

  // Minimums (px)
  const minName         = toPx(rawProps.min_name    ?? rawProps.minName,    10);
  const minTitle        = toPx(rawProps.min_title   ?? rawProps.minTitle,   10);
  const minCompany      = toPx(rawProps.min_company ?? rawProps.minCompany, 10);
  const minEmail        = toPx(rawProps.min_email   ?? rawProps.minEmail,   9);
  const minPhone        = toPx(rawProps.min_phone   ?? rawProps.minPhone,   11);
  const minAddress      = toPx(rawProps.min_address ?? rawProps.minAddress, 9);

  // Assets / side
  const logo            = getLogoSrc(rawProps.logo) || rawProps.logoUrl || "/placeholder.svg";
  const side            = rawProps.side ?? "front";
  const qr              = rawProps.qr ?? null;
  const backShow        = rawProps.backShow ?? {};
  const show = {
    logo: backShow?.logo ?? true,
    qr: backShow?.qr ?? true,
    companyName: backShow?.companyName ?? true,
  };

  // -------- BACK --------
  if (side === "back") {
    return (
      <div
        className="w-full h-[200px] rounded-xl border shadow-md p-4 flex items-center justify-center"
        style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: font_family }}
      >
        <div className="w-full h-full flex flex-col items-center justify-center">
          {show.qr ? (
            qr ? (
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
            )
          ) : null}
          {show.companyName && (
            <span className="mt-2 font-semibold text-center">{company_name || "Company"}</span>
          )}
        </div>
      </div>
    );
  }

  // -------- FRONT --------
  return (
    <div
      className="relative w-full h-[200px] rounded-xl shadow-lg overflow-hidden flex"
      style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: font_family }}
    >
      {/* Angular color band on the left */}
      <div
        className="absolute top-0 left-0 w-1/2 h-full -skew-x-12 origin-top-left"
        style={{ backgroundColor: primary_color, left: "-25%", opacity: 0.9 }}
      />
      <div
        className="absolute top-0 left-0 w-1/3 h-full -skew-x-12 origin-top-left"
        style={{ backgroundColor: primary_color, left: "-10%", opacity: 0.7 }}
      />
      <div
        className="absolute bottom-0 right-0 w-1/2 h-1/2 rounded-tl-full opacity-10"
        style={{ backgroundColor: primary_color }}
      />

      {/* Left: Logo — fixed size so it never shrinks */}
      <div className="relative z-10 w-1/3 min-w-[110px] flex items-center justify-center p-4">
        <div
          className="w-16 h-16 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
          style={{ border: `2px solid ${primary_color}` }}
        >
          <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
        </div>
      </div>

      {/* Right: Texts with SmartText auto-fit */}
      <div className="relative z-10 w-2/3 p-4 flex flex-col justify-between min-w-0">
        {/* Name / Title / Company */}
        <div className="min-w-0 text-right">
          <SmartText
            desired={sizeName}
            min={minName}
            defaultStart={22}
            autoFit
            recalcKey={font_family}
            className="font-extrabold leading-tight"
          >
            {fullname || "Full Name"}
          </SmartText>

          <SmartText
            desired={sizeTitle}
            min={minTitle}
            defaultStart={16}
            autoFit
            recalcKey={font_family}
            className="opacity-80 font-medium"
          >
            {job_title || "Job Title"}
          </SmartText>

          <SmartText
            desired={sizeCompany}
            min={minCompany}
            defaultStart={15}
            autoFit
            recalcKey={font_family}
            className="opacity-70 font-semibold mt-1"
          >
            {company_name || "Company"}
          </SmartText>
        </div>

        {/* Contact block */}
        <div className="mt-2 min-w-0">
          <SmartText
            desired={sizeEmail}
            min={minEmail}
            defaultStart={14}
            autoFit
            recalcKey={font_family}
            className="opacity-90"
          >
            {email || "email@example.com"}
          </SmartText>

          <SmartText
            desired={sizePhone}
            min={minPhone}
            defaultStart={14}
            autoFit
            recalcKey={font_family}
            className="opacity-90"
          >
            {phone_number || "+1 (555) 123-4567"}
          </SmartText>

          {company_address && (
            <div className="h-10">
              <SmartText
                desired={sizeAddress}
                min={minAddress}
                defaultStart={12}
                autoFit
                allowWrap
                recalcKey={font_family}
                className="opacity-80 leading-snug"
              >
                {company_address}
              </SmartText>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Template2;

/* ---------- utils ---------- */
function toPx(v, fb) {
  if (v == null) return fb;
  const n = Number(v);
  return Number.isFinite(n) ? n : fb;
}
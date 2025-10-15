// src/components/templates/Template1.jsx
import { useLayoutEffect, useRef, useState } from "react";
import { getLogoSrc } from "../../server/utils/logoUtils";

const FALLBACK_STACK =
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`;

function cleanupColor(c) {
  if (!c) return "#000000";
  return String(c).replace(/^['"]+|['"]+$/g, "");
}

/**
 * SmartText
 * - desired: starting font-size (px). If omitted, uses defaultStart.
 * - min: minimum font-size (px) the component will shrink to.
 * - autoFit: when true (default), shrink until it fits.
 * - allowWrap: fit by height (multiline). Otherwise single-line fit by width.
 * - step: shrink step in px.
 */
function SmartText({
  children,
  desired,
  defaultStart = 14,
  min = 9,
  step = 1,
  autoFit = true,
  allowWrap = false,
  className = "",
  style = {},
  titleOnHover = false,   // turn off tooltip by default
  recalcKey,              // 🔹 new: forces recompute when this changes
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
    setSize(Math.max(min, current));
  // 🔹 re-run when these change, including recalcKey
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
        textOverflow: "clip",   // 🔹 no ellipsis
      }}
      title={titleOnHover && typeof children === "string" ? children : undefined}
    >
      {children}
    </div>
  );
}

/* ================== Template1 ================== */
const Template1 = (rawProps) => {
  // data (snake first; camel fallback)
  const fullname        = rawProps.fullname        ?? rawProps.fullName        ?? "Name";
  const email           = rawProps.email           ?? "email@example.com";
  const company_name    = rawProps.company_name    ?? rawProps.companyName     ?? "Company";
  const job_title       = rawProps.job_title       ?? rawProps.jobTitle        ?? "Title";
  const phone_number    = rawProps.phone_number    ?? rawProps.phoneNumber     ?? "123-456-7890";
  const company_address = rawProps.company_address ?? rawProps.companyAddress  ?? "";

  // colors
  const primary_color   = cleanupColor(rawProps.primary_color ?? rawProps.primaryColor ?? "#1f2937");
  const secondary_color = cleanupColor(rawProps.secondary_color ?? rawProps.secondaryColor ?? "#dbeafe");

  // font family
  const font_family     = rawProps.font_family ?? rawProps.fontFamily ?? FALLBACK_STACK;

  // sizes (px). You can store these in DB and pass through props.
  // If not provided, defaults below are used.
  const sizeName        = toPx(rawProps.size_name ?? rawProps.sizeName, 20);
  const sizeTitle       = toPx(rawProps.size_title ?? rawProps.sizeTitle, 16);
  const sizeCompany     = toPx(rawProps.size_company ?? rawProps.sizeCompany, 15);
  const sizeEmail       = toPx(rawProps.size_email ?? rawProps.sizeEmail, 14);
  const sizePhone       = toPx(rawProps.size_phone ?? rawProps.sizePhone, 14);
  const sizeAddress     = toPx(rawProps.size_address ?? rawProps.sizeAddress, 13);

  // mins (px) for auto-fit boundaries (override via props if you want)
  const minName         = toPx(rawProps.min_name ?? rawProps.minName, 12);
  const minTitle        = toPx(rawProps.min_title ?? rawProps.minTitle, 10);
  const minCompany      = toPx(rawProps.min_company ?? rawProps.minCompany, 10);
  const minEmail        = toPx(rawProps.min_email ?? rawProps.minEmail, 9);
  const minPhone        = toPx(rawProps.min_phone ?? rawProps.minPhone, 11);
  const minAddress      = toPx(rawProps.min_address ?? rawProps.minAddress, 9);

  // global toggle to disable auto-fit (defaults true)
  const autoFit         = rawProps.auto_fit ?? rawProps.autoFit ?? true;

  // assets / side
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
        className="w-full h-[200px] rounded-xl border shadow-md p-4 flex items-center justify-between"
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

  // FRONT
  return (
    <div
      className="relative w-full h-[200px] rounded-xl border shadow-lg p-5 flex flex-col justify-between overflow-hidden hover:shadow-xl transition-all duration-300"
      style={{ backgroundColor: secondary_color, color: primary_color, fontFamily: font_family }}
    >
      {/* Decorative shapes */}
      <div className="absolute w-48 h-48 rounded-full opacity-20 -top-10 -right-16" style={{ backgroundColor: primary_color }} />
      <div className="absolute w-32 h-32 rounded-full opacity-10 -bottom-16 -left-10" style={{ backgroundColor: primary_color }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* Header: LOGO fixed + TEXT flex (logo never shrinks) */}
        <div className="flex items-start gap-3">
          <div
            className="w-16 h-16 flex-shrink-0 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
            style={{ border: `2px solid ${primary_color}` }}
          >
            <img src={logo} alt="Logo" className="w-14 h-14 object-contain" />
          </div>

          <div className="flex-1 min-w-0 text-right">
            <SmartText
              desired={sizeName}
              min={minName}
              defaultStart={20}
              autoFit={autoFit}
              className="font-extrabold leading-tight"
            >
              {fullname || "Full Name"}
            </SmartText>

            <SmartText
              desired={sizeTitle}
              min={minTitle}
              defaultStart={16}
              autoFit={autoFit}
              className="opacity-80 font-medium"
            >
              {job_title || "Job Title"}
            </SmartText>

            <SmartText
              desired={sizeCompany}
              min={minCompany}
              defaultStart={15}
              autoFit={autoFit}
              className="opacity-70 font-semibold mt-1"
            >
              {company_name || "Company"}
            </SmartText>
          </div>
        </div>

        {/* Contact info */}
        <div className="text-sm leading-6 space-y-1 mt-2 min-w-0">
          <SmartText
            desired={sizeEmail}
            min={minEmail}
            defaultStart={14}
            autoFit={autoFit}
            className="opacity-90"
          >
            {email || "email@example.com"}
          </SmartText>

          <SmartText
            desired={sizePhone}
            min={minPhone}
            defaultStart={14}
            autoFit={autoFit}
            className="opacity-90"
          >
            {phone_number || "+1 (555) 123-4567"}
          </SmartText>

          {company_address && (
            <div className="h-10">
              <SmartText
                desired={sizeAddress}
                min={minAddress}
                defaultStart={13}
                autoFit={autoFit}
                allowWrap
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

export default Template1;

/* ---------- utils ---------- */
function toPx(v, fallback) {
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
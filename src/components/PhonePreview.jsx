// PhonePreview.jsx
import { useEffect, useRef } from "react";
import {
  Phone,
  Mail,
  User,
  ImageDown,
  Building,
  Link as LinkIcon,
  Github,
  Linkedin,
} from "lucide-react";

function AutoFit({
  children,
  min = 9,          // smallest font size (px)
  max = 18,         // largest font size (px)
  lines = 1,        // how many lines we allow
  className = "",
}) {
  const boxRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const el = textRef.current;
    const box = boxRef.current;
    if (!el || !box) return;

    // reset
    el.style.whiteSpace = lines === 1 ? "nowrap" : "normal";
    el.style.display = "block";
    el.style.fontSize = `${max}px`;

    const fit = () => {
      let size = max;
      el.style.fontSize = `${size}px`;

      // shrink until it fits width/height (or we hit min)
      while (
        size > min &&
        (el.scrollWidth > box.clientWidth ||
          el.scrollHeight > box.clientHeight)
      ) {
        size -= 1;
        el.style.fontSize = `${size}px`;
      }
    };

    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
  }, [children, min, max, lines]);

  // The wrapper (fixed height) acts as the constraint box
  return (
    <div ref={boxRef} className={className} style={{ overflow: "hidden" }}>
      <div ref={textRef}>{children}</div>
    </div>
  );
}

function addHttp(url = "") {
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}
function normPhone(p = "") {
  return p.replace(/[^\d+]/g, "");
}

export default function PhonePreview({
  name = "Sofia",
  title = "Designer",
  company = "BeLift",
  phone = "0661489477",
  email = "email@example.com",
  website = "",
  github = "",
  linkedin = "",
  profile_photo = "",
  logo,
}) {
  // preview-only rows (non-clickable)
  const actions = [
    phone && { label: phone, Icon: Phone, kind: "preview" },
    email && { label: email, Icon: Mail, kind: "preview" },
    { label: "Save Contact", Icon: User, kind: "preview" },
    { label: "Save Business Card", Icon: ImageDown, kind: "preview" },
  ].filter(Boolean);

  // Build present links in order: Website, GitHub, LinkedIn
  const present = [
    website ? { key: "website", label: "Website", Icon: LinkIcon } : null,
    github ? { key: "github", label: "GitHub", Icon: Github } : null,
    linkedin ? { key: "linkedin", label: "LinkedIn", Icon: Linkedin } : null,
  ].filter(Boolean);

  // 0.25 smaller for rows below the header (header untouched)
  const rowText = "text-[9.25px]";
  const rowHeight = "h-[26px]";
  const rowPadX = "px-[9px]";
  const iconBox = "w-[26px] h-[26px]";
  const iconSize = "w-[13px] h-[13px]";
  const linkPillH = "h-[26px]";
  const linkIcon = "w-[13px] h-[13px]";

  const LinksRow = () => {
    const n = present.length;
    if (n === 0) return null;

    const WebsiteChip = () => (
      <div
        aria-disabled
        className={`min-w-0 ${linkPillH} rounded-lg px-2 flex items-center justify-center
                    text-[9px] leading-none font-semibold bg-[#1F2937] text-white gap-1 cursor-default select-none`}
        title="Website"
      >
        <LinkIcon className={linkIcon} strokeWidth={2.2} />
        <span className="truncate">Website</span>
      </div>
    );
    const IconChip = ({ Icon, title }) => (
      <div
        aria-disabled
        className={`${linkPillH} rounded-full flex items-center justify-center bg-[#1F2937] text-white cursor-default select-none`}
        title={title}
      >
        <Icon className={linkIcon} strokeWidth={2.2} />
      </div>
    );
    const LabeledChip = ({ Icon, label }) => (
      <div
        aria-disabled
        className={`min-w-0 ${linkPillH} rounded-lg px-2 flex items-center justify-center
                    text-[9px] leading-none font-semibold bg-[#1F2937] text-white gap-1 cursor-default select-none`}
        title={label}
      >
        <Icon className={linkIcon} strokeWidth={2.2} />
        <span className="truncate">{label}</span>
      </div>
    );

    // 3 links → Website (text) + icons
    if (n === 3) {
      return (
        <div className="w-full rounded-xl p-2 mb-2 border bg-white/70 border-white/80">
          <div className="grid grid-cols-4 gap-1 items-center">
            <div className="col-span-2"><WebsiteChip /></div>
            <div className="w-full"><IconChip Icon={Github} title="GitHub" /></div>
            <div className="w-full"><IconChip Icon={Linkedin} title="LinkedIn" /></div>
          </div>
        </div>
      );
    }

    // 2 links
    if (n === 2) {
      const keys = present.map(p => p.key).join(",");
      if (keys.includes("website")) {
        // Website + one icon
        const iconOnly = present.find(p => p.key !== "website");
        const IconComp = iconOnly.key === "github" ? Github : Linkedin;
        const title = iconOnly.label;
        return (
          <div className="w-full rounded-xl p-2 mb-2 border bg-white/70 border-white/80">
            <div className="grid grid-cols-3 gap-1 items-center">
              <div className="col-span-2"><WebsiteChip /></div>
              <div className="w-full"><IconChip Icon={IconComp} title={title} /></div>
            </div>
          </div>
        );
      }
      // Two icons only
      return (
        <div className="w-full rounded-xl p-2 mb-2 border bg-white/70 border-white/80">
          <div className="grid grid-cols-2 gap-1 items-center">
            <div className="w-full"><LabeledChip Icon={Github} label="GitHub" /></div>
            <div className="w-full"><LabeledChip Icon={Linkedin} label="LinkedIn" /></div>
          </div>
        </div>
      );
    }

    // 1 link
    if (n === 1) {
      const only = present[0];
      if (only.key === "website") {
        // Website full-width
        return (
          <div className="w-full rounded-xl p-2 mb-2 border bg-white/70 border-white/80">
            <div className="grid grid-cols-1 items-center">
              <WebsiteChip />
            </div>
          </div>
        );
      }
      // Single GitHub or LinkedIn → full-width pill **with label**
      const IconComp = only.key === "github" ? Github : Linkedin;
      const label = only.label;
      return (
        <div className="w-full rounded-xl p-2 mb-2 border bg-white/70 border-white/80">
          <div className="grid grid-cols-1 items-center">
            <LabeledChip Icon={IconComp} label={label} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6">
      <div className="mx-auto w-[240px]">
        <div className="relative mx-auto rounded-[44px] bg-black shadow-2xl" style={{ aspectRatio: "9 / 19" }}>
          <div className="absolute inset-[10px] rounded-[36px] bg-[#EAF3FB] overflow-hidden flex flex-col">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-3 bg-black rounded-b-[20px]" />

            {/* BODY — header untouched */}
            <div className="flex-1 pt-10 px-4 pb-4 flex flex-col">
              {/* Header (unchanged) */}
              <div className="w-full rounded-xl border border-white/80 bg-white/70 shadow-lg p-4 mb-3 text-center mx-auto shrink-0">
                {profile_photo ? (
                  <img
                    src={profile_photo}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md mx-auto -mt-9"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full ring-2 ring-white/80 shadow-md mx-auto -mt-9 bg-gray-300 flex items-center justify-center text-white font-semibold text-2xl">
                    {name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                )}

                {/* Name */}
                <AutoFit
                  max={18}
                  min={11}
                  lines={2}
                  className="mt-4 h-[38px] leading-tight font-bold text-[#1e2a3a]"
                >
                  {name}
                </AutoFit>

                {/* Title */}
                <AutoFit
                  max={13}
                  min={9}
                  lines={1}
                  className="mt-0.5 h-[16px] text-[#5f748d]"
                >
                  {title}
                </AutoFit>

                {/* Company (or company address if you prefer) */}
                <AutoFit
                  max={12}
                  min={9}
                  lines={1}
                  className="mt-2 h-[16px] text-[#5f748d]"
                >
                  <span className="inline-flex items-center gap-2">
                    <Building size={13} />
                    <span className="font-semibold">{company}</span>
                  </span>
                </AutoFit>
              </div>


              {/* Adaptive links row */}
              <LinksRow />

              {/* Phone / Email rows — NON-clickable; 0.25 smaller */}
              <div className="w-full">
                {actions.map(({ label, Icon }, i) => {
                  const content = (
                    <div
                      className={`rounded-xl p-[7px] mb-[7px] flex items-center justify-between border bg-white/70 border-white/80 ${i % 2 !== 0 ? "flex-row-reverse" : ""
                        } gap-1 cursor-default select-none`}
                      aria-disabled
                    >
                      <div className={`flex-1 h-[26px] rounded-lg px-[9px] flex items-center justify-center text-[9.25px] font-semibold bg-[#1F2937] text-white`}>
                        {label}
                      </div>
                      <div className={`flex items-center justify-center rounded-lg w-[26px] h-[26px] bg-[#EDF2F7] border border-white/70`}>
                        <Icon className={`text-[#1F2937] w-[13px] h-[13px]`} />
                      </div>
                    </div>
                  );
                  return <div key={`${label}-${i}`}>{content}</div>;
                })}
              </div>

              {/* Save button (unchanged) */}
              <div className="text-center mt-auto mb-1 shrink-0">
                <button className="bg-[#1F2937] text-white text-[13px] font-semibold py-2 px-3 rounded-full shadow-lg">
                  Save Card to Reo
                </button>
              </div>
            </div>
          </div>
          {/* /bezel */}
        </div>
      </div>
    </div>
  );
}

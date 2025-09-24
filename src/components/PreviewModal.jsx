// src/components/PreviewModal.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Template1 from "./templates/Template1";
import Template2 from "./templates/Template2";
import Template3 from "./templates/Template3";
import Template4 from "./templates/Template4";
import Template5 from "./templates/Template5";
import Template6 from "./templates/Template6";
// import { Phone, Mail, Building, Download, ImageDown, Scan } from "lucide-react";
import { Phone, Mail, Building, Download, ImageDown, Scan, User, Save } from "lucide-react";


const templateMap = { template1: Template1, template2: Template2, template3: Template3, template4: Template4, template5: Template5, template6: Template6 };

// unify fields (camelCase & snake_case) and pass EVERYTHING needed to templates
const buildTemplateProps = (raw = {}) => {
  const props = {
    id: raw.id,
    // names
    fullName: raw.fullName ?? raw.fullname ?? "Your Name",
    jobTitle: raw.jobTitle ?? raw.job_title ?? "Your Title",
    email: raw.email ?? "email@example.com",
    phoneNumber: raw.phoneNumber ?? raw.phone_number ?? "00000000",
    companyName: raw.companyName ?? raw.company_name ?? "Company",
    companyAddress: raw.companyAddress ?? raw.company_address ?? "",
    // colors
    primaryColor: raw.primaryColor ?? raw.primary_color ?? "#e2e8f0",
    secondaryColor: raw.secondaryColor ?? raw.secondary_color ?? "#94a3b8",
    // logo
    logo: raw.logo ?? raw.logoUrl ?? "https://via.placeholder.com/96",
    logoUrl: raw.logoUrl ?? raw.logo ?? "https://via.placeholder.com/96",
    // ✅ carry QR image/url (data URL or http URL)
    qr: raw.qr ?? null,
    // keep everything else just in case templates read extra props
    ...raw,
  };
  return props;
};

export default function PreviewModal() {
  const navigate = useNavigate();
  const { state } = useLocation() || {};

  // everything passed forward from previous steps:
  const {
    cardType,
    cardId,
    teamId,
    primaryColor,
    secondaryColor,
    croppedLogo,
    templateKey = "template1",
    card = {},
  } = state || {};

  const effectiveCardId =
    cardId ??
    (() => {
      const s = localStorage.getItem("personal_card_id");
      return s && s !== "null" && s !== "undefined" ? Number(s) : null;
    })();

  const effectiveTeamId =
    teamId ??
    (() => {
      const s = localStorage.getItem("team_id");
      return s && s !== "null" && s !== "undefined" ? Number(s) : null;
    })();

  const T = templateMap[templateKey] || Template1;
  const p = buildTemplateProps({
    ...card,
    primaryColor,
    secondaryColor,
    logoUrl: card.logoUrl ?? croppedLogo ?? card.logo,
  });

  const handleBack = () => {
    // go back to Template Selection (Step 5), preserve state
    navigate("/create/template-selection", {
      state: {
        cardType,
        cardId: effectiveCardId,
        teamId: effectiveTeamId,
        primaryColor,
        secondaryColor,
        croppedLogo,
        templateKey,
        card,
      },
    });
  };

  const handleDone = () => {
    // finish the flow → back to Home
    navigate("/home");
  };


  const avatarColors = [
    "bg-blue-500", "bg-green-500", "bg-pink-500", "bg-purple-500",
    "bg-indigo-500", "bg-yellow-500", "bg-red-500"
  ];
  const colorFor = (seed = "C") => {
    let h = 0; for (let i = 0; i < seed.length; i++) h = seed.charCodeAt(i) + ((h << 5) - h);
    return avatarColors[Math.abs(h) % avatarColors.length];
  };

  // Avatar (image or initial)
  const Avatar = ({ name, src, size = 40 }) => {
    const classBase = "rounded-full object-cover ring-2 ring-white/80 shadow";
    if (src) {
      return <img src={src} alt={name} style={{ width: size, height: size }} className={classBase} />;
    }
    const initial = (name || "C").charAt(0).toUpperCase();
    return (
      <div
        style={{ width: size, height: size }}
        className={`flex items-center justify-center text-white font-semibold ${classBase} ${colorFor(name)} `}
      >
        {initial}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={handleDone} />

      {/* modal container */}
      <div className="relative z-[1000] w-[min(1100px,92vw)] max-h-[88vh] rounded-2xl bg-white shadow-2xl flex flex-col">
        {/* header */}
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-[#0b2447]">
              Preview your card & phone view
            </h2>
            <p className="text-sm text-slate-500">
              Ready to get your virtual business card and share with others?
            </p>
          </div>
          <button
            className="rounded-md px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            onClick={handleDone}
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-auto">
          {/* LEFT: template preview (Front + Back) */}
          <div className="bg-[#f6f9ff] rounded-xl p-4 shadow-sm">
            <div className="flex flex-col items-center gap-6">
              {/* --- FRONT --- */}
              <div className="w-full">
                <div className="text-xs text-center tracking-wide text-slate-500 mb-2">
                  Card Front View
                </div>
                <div className="mx-auto w-[320px] h-[200px] rounded-xl overflow-hidden shadow relative bg-white">
                  <div className="absolute inset-0">
                    <T
                      {...p}
                      side="front"
                      style={{ width: "100%", height: "100%" }}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>

              {/* --- BACK --- */}
              <div className="w-full">
                <div className="text-xs text-center tracking-wide text-slate-500 mb-2">
                  Card Back View
                </div>
                <div className="mx-auto w-[320px] h-[200px] rounded-xl overflow-hidden shadow relative bg-white">
                  <div className="absolute inset-0">
                    <T
                      {...p}
                      side="back"
                      qr={p.qr}
                      backShow={{ logo: false, qr: true, companyName: true }}
                      style={{ width: "100%", height: "100%" }}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              You can always customize or modify your chosen template later in
              your card's settings.
            </p>
          </div>

          {/* RIGHT: phone preview */}
          <div className="bg-gradient-to-b from-[#F1F7FE] to-[#DDEBFA] rounded-xl p-4 shadow-sm h-full overflow-hidden font-sans">
            <p className="text-slate-600 text-sm mb-3 text-center">
              This is what people will see when they scan your card.
            </p>

            <div className="mx-auto w-[220px]">
              {/* Phone bezel */}
              <div className="relative mx-auto rounded-[44px] bg-black shadow-2xl" style={{ aspectRatio: "9 / 19" }}>
                {/* Screen */}
                <div className="absolute inset-[10px] rounded-[36px] bg-[#EAF3FB] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-3 bg-black rounded-b-[22px]" />

                  {/* Phone content */}
                  <div className="pt-10 px-3 pb-3 h-full overflow-auto mx auto">
                    {/* Header card */}
                    <div className="w-[175px] h-[135px] rounded-xl border border-white/80 bg-white/70 shadow-lg p-4 mb-4 text-center">
                      {card.profile_photo ? (
                        <img
                          src={`${card.profile_photo}`}
                          alt={card.fullname}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md mx-auto -mt-2"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full ring-2 ring-white/80 shadow-md mx-auto -mt-9 bg-gray-300 flex items-center justify-center text-white font-semibold text-2xl">
                          {(card.fullname || "C").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <h1 className="text-l font-bold text-[#1e2a3a] mt-4">{p.fullName || "Sofia"}</h1>
                      <p className="text-sm text-[#5f748d]">{p.jobTitle || "Accountant"}</p>
                      <div className="flex items-center justify-center gap-2 mt-2 text-[#5f748d]">
                        <Building size={13} />
                        <span className="font-semibold">{p.companyName || "BeLift"}</span>
                      </div>
                    </div>

                    {/* Action rows */}
                    {[
                      { label: p.phoneNumber || "0661489477", Icon: Phone, type: "link" },
                      { label: "Email Address", Icon: Mail },
                      { label: "Save Contact", Icon: User, type: "button" },
                      { label: "Save Business Card", Icon: Scan, type: "button" },

                    ].map(({ label, href, Icon, onClick, type }, i) => {
                      const content = (
                        <div className={`rounded-xl p-2 mb-2 flex items-center justify-between border bg-white/70 border-white/80 ${i % 2 !== 0 ? "flex-row-reverse" : ""} gap-1`}>
                          <div className="flex-1 h-8 rounded-lg  px-3 flex items-center justify-center text-[11px] font-semibold bg-[#1F2937] text-white">
                            {label}
                          </div>
                          <div className="flex items-center justify-center rounded-lg w-8 h-8 bg-[#EDF2F7] border border-white/70">
                            <Icon strokeWidth={2.5} className="text-[#1F2937] w-4 h-4" />
                          </div>
                        </div>
                      );


                      return type === "link" ? (
                        <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                          {content}
                        </a>
                      ) : (
                        <div key={label} onClick={onClick} className="cursor-pointer">
                          {content}
                        </div>
                      );
                    })}
                    <div className="text-center mt-6 mb-1">
                      <button
                        className="bg-[#1F2937] text-white font-semibold py-1 px-3 rounded-full shadow-lg   disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        Save Card to Reo

                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* footer */}
        <div className="flex-shrink-0 flex items-center justify-between gap-3 border-t px-6 py-4">
          <button
            onClick={handleBack}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back
          </button>
          <button
            onClick={handleDone}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
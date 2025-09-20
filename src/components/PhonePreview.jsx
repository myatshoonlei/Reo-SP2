// src/components/PhonePreview.jsx
import { Phone, Mail, User, Scan, Save } from "lucide-react";

export default function PhonePreview({
  name = "Sofia",
  title = "Designer",
  company = "BeLift",
  phone = "0661489477",
  email = "email@example.com",
  avatar = "/default-avatar.png",
  logo, // optional, if you want to show company logo later
}) {
  const actions = [
    { label: phone, Icon: Phone, dark: true },
    { label: "Email Address", Icon: Mail, dark: true },
    { label: "Save Contact", Icon: User, dark: true },
    { label: "Virtual Card", Icon: Scan, dark: true },
    { label: "Save Card to Reo", Icon: Save, dark: true },
  ];

  return (
    <div className="mx-auto w-[230px]">
      {/* Phone bezel */}
      <div
        className="relative mx-auto rounded-[44px] bg-black shadow-2xl"
        style={{ aspectRatio: "9 / 19" }}
      >
        {/* Screen */}
        <div className="absolute inset-[10px] rounded-[36px] bg-[#EAF3FB] overflow-hidden">
          {/* Notch */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-6 bg-black rounded-b-[22px]" />

          {/* Scrollable phone content */}
          <div className="pt-7 px-3 pb-3 h-full overflow-auto">
            {/* Header card */}
            <div className="rounded-2xl border border-white/70 bg-white/70 shadow-sm p-2 mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold text-[#2a3b4f] opacity-80">
                  {company}
                </span>
                <span className="text-[10px] font-semibold text-[#2a3b4f] opacity-80">
                  Reo
                </span>
              </div>

              <div className="flex items-center gap-2">
                <img
                  src={avatar}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-white/80 shadow"
                />
                <div>
                  <div className="text-lg font-bold text-[#1e2a3a] leading-tight">
                    {name}
                  </div>
                  <div className="text-xs text-[#5f748d]">{title}</div>
                </div>
              </div>

              {/* subtle wave bar */}
              <div className="mt-2 h-4 rounded-lg bg-white/60" />
            </div>

            {/* Action rows (alternating layout) */}
            {actions.map(({ label, Icon, dark }, i) => (
              <div
                key={i}
                className={`mb-2 rounded-xl p-1 flex items-center justify-between border ${
                  dark ? "bg-white/0 border-white/60" : "bg-white/70 border-white/80"
                } ${i % 2 !== 0 ? "flex-row-reverse" : ""} gap-1`}
              >
                {/* main pill */}
                <div
                  className={`flex-1 h-8 rounded-lg px-3 flex items-center justify-center text-xs font-semibold ${
                    dark
                      ? "bg-[#1F2937] text-white"
                      : "bg-white text-[#1F2937] border border-slate-200"
                  }`}
                >
                  {label}
                </div>

                {/* icon bubble */}
                <div
                  className={`flex items-center justify-center rounded-lg w-8 h-8 ${
                    dark ? "bg-white/10" : "bg-[#EDF2F7] border border-white/70"
                  }`}
                >
                  <Icon strokeWidth={2.7} className="text-[#1F2937] w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
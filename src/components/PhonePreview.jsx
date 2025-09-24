import { Phone, Mail, User, ImageDown, Save, Building } from "lucide-react";

export default function PhonePreview({
  name = "Sofia",
  title = "Designer",
  company = "BeLift",
  phone = "0661489477",
  email = "email@example.com",
  avatar = "/default-avatar.png",
  logo,
}) {
  const actions = [
    { label: phone, Icon: Phone,  },
    { label: "Email Address", Icon: Mail,  },
    { label: "Save Contact", Icon: User, },
    { label: "Save Business Card", Icon: ImageDown, },
  ];

  return (
    <div className="p-6">
      <div className="mx-auto w-[220px]">
        <div className="relative mx-auto rounded-[44px] bg-black shadow-2xl" style={{ aspectRatio: "9 / 19" }}>
          <div className="absolute inset-[10px] rounded-[36px] bg-[#EAF3FB] overflow-hidden">
            <div className="absolute left-1/2 -translate-x-1/2 top-0 w-28 h-3 bg-black rounded-b-[22px]" />

            <div className="pt-10 px-3 pb-3 h-full overflow-auto">
              {/* Header card */}
              <div className="w-[175px] h-[135px] rounded-xl border border-white/80 bg-white/70 shadow-lg p-4 mb-4 text-center mx-auto">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white/80 shadow-md mx-auto -mt-2"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full ring-2 ring-white/80 shadow-md mx-auto -mt-9 bg-gray-300 flex items-center justify-center text-white font-semibold text-2xl">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                <h1 className="text-lg font-bold text-[#1e2a3a] mt-4">{name}</h1>
                <p className="text-sm text-[#5f748d]">{title}</p>
                <div className="flex items-center justify-center gap-2 mt-2 text-[#5f748d]">
                  <Building size={13} />
                  <span className="font-semibold">{company}</span>
                </div>
              </div>

              {/* Action rows */}
              {actions.map(({ label, href, Icon, onClick, type }, i) => {
                const content = (
                  <div className={`rounded-xl p-2 mb-2 flex items-center justify-between border bg-white/70 border-white/80 ${i % 2 !== 0 ? "flex-row-reverse" : ""} gap-1`}>
                    <div className="flex-1 h-8 rounded-lg px-3 flex items-center justify-center text-[10px] font-semibold bg-[#1F2937] text-white">
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

              {/* Save button */}
              <div className="text-center mt-6 mb-1">
                <button className="bg-[#1F2937] text-white text-[13px] font-semibold py-2 px-3 rounded-full shadow-lg disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                  Save Card to Reo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mail, Phone, Github, Linkedin } from "lucide-react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import PhonePreview from "../components/PhonePreview";
import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import Template3 from "../components/templates/Template3";
import Template4 from "../components/templates/Template4";
import Template5 from "../components/templates/Template5";
import Template6 from "../components/templates/Template6";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";
const CardComponentById = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
  6: Template6,
};

const DEFAULT_STACK = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif`;

export default function EditMyLinks() {
  const navigate = useNavigate();
  const { cardId: paramId } = useParams();
  const [cardId, setCardId] = useState(
    paramId || localStorage.getItem("personal_card_id") || null
  );

  // token normalization (handles quoted token + adds Bearer)
  const tokenRaw = localStorage.getItem("token");
  const token =
    tokenRaw && !/^bearer /i.test(tokenRaw)
      ? `Bearer ${tokenRaw.replace(/^"|"$/g, "")}`
      : tokenRaw;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // base card info for preview
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#1F2937");
  const [secondaryColor, setSecondaryColor] = useState("#f5f9ff");
  const [fontFamily, setFontFamily] = useState(DEFAULT_STACK);
  const [templateId, setTemplateId] = useState(1);

  // CONTACT SIDE: only these two
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [showPhonePreview, setShowPhonePreview] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!cardId) {
        setErr("No card selected");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErr("");

        // Fetch base card (for preview + fallback values)
        const baseRes = await fetch(`${API_BASE}/api/personal-card/${cardId}`, {
          headers: { Authorization: token },
        });
        if (!baseRes.ok) throw new Error("Failed to load card");
        const base = await baseRes.json();
        const d = base?.data ?? base;

        setFullName(d.fullname ?? "");
        setJobTitle(d.job_title ?? d.jobTitle ?? "");
        setCompanyName(d.company_name ?? d.companyName ?? "");
        setPrimaryColor(d.primary_color ?? d.primaryColor ?? "#1F2937");
        setSecondaryColor(d.secondary_color ?? d.secondaryColor ?? "#f5f9ff");
        setFontFamily(d.font_family ?? d.fontFamily ?? DEFAULT_STACK);
        const tId = Number(d.templateId);
        const keyToId = {
          template1: 1,
          template2: 2,
          template3: 3,
          template4: 4,
          template5: 5,
          template6: 6,
        };
        const key = (d.component_key ?? d.componentKey ?? "").toString();
        setTemplateId(
          Number.isFinite(tId) && [1, 2, 3, 4, 5, 6].includes(tId)
            ? tId
            : keyToId[key] || 1
        );

        const logoB64 = d.logo || d.logoBase64;
        const photoB64 = d.profile_photo || d.profilePhoto;
        setLogo(logoB64 ? `data:image/png;base64,${logoB64}` : null);
        setProfilePhoto(photoB64 ? `data:image/jpeg;base64,${photoB64}` : null);

        // Fetch contact-side; fall back to base card values if missing
        const contactRes = await fetch(`${API_BASE}/api/contacts/${cardId}`, {
          headers: { Authorization: token },
        });

        if (contactRes.ok) {
          const cj = await contactRes.json();
          const c = cj?.data ?? cj ?? {};
          setEmail(c.email ?? d.email ?? "");
          setPhone(c.phone ?? d.phone_number ?? d.phoneNumber ?? "");
        } else {
          // no separate contact doc yet — just use base card
          setEmail(d.email ?? "");
          setPhone(d.phone_number ?? d.phoneNumber ?? "");
        }

        // persist id
        localStorage.setItem("personal_card_id", cardId);
      } catch (e) {
        setErr(e.message || "Could not load contact side");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cardId, token]);

  const saveAll = async () => {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      // Save ONLY phone + email
      const payload = { phone, email };

      const res = await fetch(`${API_BASE}/api/contacts/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ phone, email }), // If your backend expects snake_case, use { phone_number: phone, email }
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || j?.message || "Save failed");
      }

      setOk("Saved!");
      setTimeout(() => setOk(""), 1200);
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
     navigate("/home");
  };

  if (loading) {
    return (
      <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
        <Navbar onSave={saveAll} saving={saving} onClose={closeModal} />
        <div className="pt-24 p-6 text-slate-600">Loading…</div>
      </div>
    );
  }

  const CardComponent = CardComponentById[templateId] || Template1;
  const previewProps = {
    fullName,
    jobTitle,
    companyName,
    phoneNumber: phone,
    email,
    profile_photo: profilePhoto,
    logo,
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    font_family: fontFamily,
    fontFamily,
  };

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar onSave={saveAll} saving={saving} onClose={closeModal} />

      <div className="flex pt-24">
        <Sidebar />

        <div className="flex-1 px-6 pt-4 h-[calc(100vh-80px)] overflow-hidden">
          {(err || ok) && (
            <div className="pt-3">
              {err && (
                <div className="mb-2 p-2 rounded bg-red-50 text-red-700">
                  {err}
                </div>
              )}
              {ok && (
                <div className="mb-2 p-2 rounded bg-green-50 text-green-700">
                  {ok}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-11 gap-4 items-center h-full">
            {/* Left: form card (single “Personal Links” box) */}
            <main className="col-span-11 md:col-span-8 lg:col-span-7 h-full">
              <div className="rounded-2xl bg-white shadow-sm border border-[#d6e6fb]">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h2 className="text-lg font-semibold text-[#0b2447]">
                      My Links
                    </h2>
                    <p className="text-sm text-slate-500">
                      Edit your Email and Contact Number.
                    </p>
                  </div>
                </div>

                {/* PERSONAL LINKS ONLY */}
                <section className="m-4 rounded-2xl border border-[#7aa3d2]/60 p-4">
                  <h3 className="text-[#0b2447] font-semibold mb-3">
                    Personal Links
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Gmail */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm text-[#0b2447] flex items-center gap-2 mb-1">
                        <Mail size={16} /> Email
                      </label>
                      <input
                        type="email"
                        className="w-full border rounded-xl px-3 py-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>

                    {/* Contact Number */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm text-[#0b2447] flex items-center gap-2 mb-1">
                        <Phone size={16} /> Contact Number
                      </label>
                      <input
                        className="w-full border rounded-xl px-3 py-2"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(+66) 80-000-0000"
                      />
                    </div>
                  </div>
                </section>
                {/* EXTERNAL LINKS BOX */}
                <section className="m-4 rounded-2xl border border-[#7aa3d2]/60 p-4">
                  <h3 className="text-[#0b2447] font-semibold mb-3">
                    External Links
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* GitHub */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm text-[#0b2447] flex items-center gap-2 mb-1">
                        <Github size={16} /> GitHub
                      </label>
                      <input
                        className="w-full border rounded-xl px-3 py-2"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://github.com/yourname"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="col-span-1 sm:col-span-2">
                      <label className="text-sm text-[#0b2447] flex items-center gap-2 mb-1">
                        <Linkedin size={16} /> LinkedIn
                      </label>
                      <input
                        className="w-full border rounded-xl px-3 py-2"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="https://www.linkedin.com/in/yourname"
                      />
                    </div>
                  </div>

                  {/* (Optional) Add more links button placeholder */}
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-sm px-3 py-2 border rounded-lg hover:bg-[#f2f7fd]"
                      onClick={() => alert("Coming soon")}
                    >
                      + Add more links
                    </button>
                  </div>
                </section>
              </div>
            </main>

            {/* Right: preview */}
            <aside className="col-span-11 md:col-span-4 self-center justify-center">
            {/* keep it visible and start near the top of the page */}
            <div className="md:sticky md:top-24 pr-2">
              {/* perspective on parent */}
              <div className="relative w-full max-w-sm mx-auto" style={{ perspective: "1000px" }}>
                <div className="text-sm text-center mb-2 text-[#0b2447] opacity-80">
                  Click to switch to {showPhonePreview ? "Card View" : "Phone Preview"}
                </div>

                  <div
                  className="relative w-full h-[520px] cursor-pointer transition-transform duration-700 ease-in-out"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: showPhonePreview ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                  onClick={() => setShowPhonePreview((prev) => !prev)}
                >
                    {/* FRONT: card */}
                    <div
                    className="absolute inset-0"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}
                  >
                      <div className="mx-auto w-[360px] h-[220px] rounded-xl overflow-hidden shadow relative bg-white">
                        <CardComponent
                          {...previewProps}
                          side="front"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>

                    {/* BACK: phone */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        transformOrigin: "top center",
                      }}
                    >
                      <div
                        style={{
                          transform: "scale(0.95)",
                          transformOrigin: "top center",
                        }}
                      >
                        <PhonePreview
                          name={fullName || "Your Name"}
                          title={jobTitle || "Job Title"}
                          company={companyName || "Company"}
                          phone={phone || "Phone"}
                          email={email || "email@example.com"}
                          avatar={profilePhoto}
                          logo={logo}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import PhonePreview from "../components/PhonePreview";
import UploadTile from "../components/UploadTile";
import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import Template3 from "../components/templates/Template3";
import Template4 from "../components/templates/Template4";
import Template5 from "../components/templates/Template5";
import Template6 from "../components/templates/Template6";
import useEditApi, { useAuthHeader } from "../hooks/useEditApi";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const templateMap = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6,
};

const templateIdToKey = (id) =>
  ({
    1: "template1",
    2: "template2",
    3: "template3",
    4: "template4",
    5: "template5",
    6: "template6",
  }[Number(id)] || "template1");

const buildTemplateProps = (raw = {}) => {
  const props = {
    id: raw.id,
    fullName: raw.fullname ?? "Your Name",
    jobTitle: raw.job_title ?? "Your Title",
    email: raw.email ?? "email@example.com",
    phoneNumber: raw.phone_number ?? "00000000",
    companyName: raw.company_name ?? "Company",
    companyAddress: raw.company_address ?? raw.companyAddress ?? "",
    primaryColor: raw.primary_color ?? "#1F2937",
    secondaryColor: raw.secondary_color ?? "#f5f9ff",
    logo: raw.logo ?? null,
    logoUrl: raw.logoUrl ?? raw.logo ?? null,
    font_family: raw.font_family ?? raw.fontFamily,
    fontFamily: raw.fontFamily ?? raw.font_family,
    profile_photo: raw.profile_photo ?? null,
    ...raw,
  };
  return props;
};
const DEFAULT_AVATAR =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <rect fill='#f1f5f9' width='100%' height='100%'/>
  <circle cx='150' cy='120' r='60' fill='#cbd5e1'/>
  <rect x='75' y='200' width='150' height='60' rx='30' fill='#cbd5e1'/>
  <text x='150' y='285' text-anchor='middle' font-size='14' fill='#94a3b8'>Add photo</text>
</svg>
`);

const DEFAULT_LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
  <rect fill='#f8fafc' width='100%' height='100%'/>
  <rect x='75' y='90' width='150' height='120' rx='15' fill='#cbd5e1'/>
  <text x='150' y='250' text-anchor='middle' font-size='14' fill='#94a3b8'>Add logo</text>
</svg>
`);

export default function EditCardPage({ mode = "personal", initialCardId, onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const { cardId: paramCardId, memberId, teamId } = useParams();
  const isTeam = !!memberId;
  const [cardId, setCardId] = useState(
    paramCardId ||
      initialCardId ||
      localStorage.getItem("personal_card_id") ||
      null
  );
  const navigate = useNavigate();

  // text fields
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [bio, setBio] = useState("");

  const [fontFamily, setFontFamily] = useState(
    `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif`
  );
  const [website, setWebsite] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [companyLogoUrl, setCompanyLogoUrl] = useState(null);

  const [profileFile, setProfileFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [showPhonePreview, setShowPhonePreview] = useState(false); // Start with phone view
  const [templateId, setTemplateId] = useState(1);
  const [primaryColor, setPrimaryColor] = useState("#1F2937");
  const [secondaryColor, setSecondaryColor] = useState("#f5f9ff");

  // cropper modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropMode, setCropMode] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const prevBlobUrls = useRef([]);
  const setPreviewUrl = (setter, url) => {
    setter(url);
    if (url?.startsWith("blob:")) prevBlobUrls.current.push(url);
  };

  const api = useEditApi(mode);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        let t = token;
        if (t?.startsWith('"') && t?.endsWith('"')) t = t.slice(1, -1);
        if (t && !/^bearer /i.test(t)) t = `Bearer ${t}`;

        const url = isTeam
          ? `${API_BASE}/api/teamInfo/member/${memberId}`
          : `${API_BASE}/api/personal-card/${cardId}`;
        const res = await fetch(url, {
          headers: { Authorization: t },
        });
        if (!res.ok) throw new Error("Failed to load card");

        const j = await api.load();
        const d = j?.data ?? j;

        setFullname(d.fullname || "");
        setEmail(d.email || "");
        setCompanyName(d.company_name ?? d.companyName ?? "");
        setJobTitle(d.job_title ?? d.jobTitle ?? "");
        setPhoneNumber(d.phone_number ?? d.phoneNumber ?? "");
        setCompanyAddress(d.company_address ?? d.companyAddress ?? "");
        setBio(d.bio || "");
        setFontFamily(d.font_family ?? d.fontFamily ?? fontFamily);
        setWebsite(d.website ?? "");
        setGithub(d.github ?? "");
        setLinkedin(d.linkedin ?? "");
        

        const logoB64 = d.logo || d.logoBase64;
        const photoB64 = d.profile_photo || d.profilePhoto;
        setCompanyLogoUrl(logoB64 ? `data:image/png;base64,${logoB64}` : null);
        setProfileImageUrl(
          photoB64 ? `data:image/jpeg;base64,${photoB64}` : null
        );

        const fromId = Number(d.templateId);
        const fromKey = (d.component_key ?? d.componentKey ?? "").toString();
        const keyToId = {
          template1: 1,
          template2: 2,
          template3: 3,
          template4: 4,
          template5: 5,
          template6: 6,
        };

        const chosenTemplateId =
          Number.isFinite(fromId) && [1, 2, 3, 4, 5, 6].includes(fromId)
            ? fromId
            : keyToId[fromKey] || 1;

        setTemplateId(chosenTemplateId);

        setPrimaryColor(d.primary_color ?? d.primaryColor ?? "#1F2937");
        setSecondaryColor(d.secondary_color ?? d.secondaryColor ?? "#f5f9ff");

        const id = d?._id || d?.id || (isTeam ? memberId : cardId);
        if (id) {
          setCardId(id);
          localStorage.setItem("personal_card_id", id);
        }
      } catch (e) {
        setErr(e.message || "Could not load card");
      } finally {
        setLoading(false);
      }
    };

    if (cardId) load();
    if (isTeam ? memberId : cardId) load();
    return () => {
      prevBlobUrls.current.forEach((u) => URL.revokeObjectURL(u));
      prevBlobUrls.current = [];
    };
  }, [cardId, memberId, token]);

  const saveAll = async () => {
    try {
      setSaving(true);
      setErr("");
      setOk("");

      if (!api?.id) throw new Error("No card/member to update.");

      const uploads = [];
      if (profileFile) {
        const fd = new FormData();
        fd.append("profile", profileFile);
        fd.append("cardId", cardId);
        uploads.push(
          fetch(`${API_BASE}/api/profile-photo`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
        );
      }

      if (logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        fd.append("cardType", "Myself");
        fd.append("cardId", cardId);
        uploads.push(
          fetch(`${API_BASE}/api/upload-logo`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          })
        );
      }

      if (uploads.length) {
        const resArr = await Promise.all(uploads);
        const bad = resArr.find((r) => !r.ok);
        if (bad) {
          const j = await bad.json().catch(() => ({}));
          throw new Error(j?.error || "Image upload failed");
        }
      }

      const payload = {
        fullname,
        email,
        companyName,
        jobTitle,
        phoneNumber,
        companyAddress,
        bio,
        primaryColor,
        secondaryColor,
        font_family: fontFamily,
      };

      const res = await api.save(payload);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || j?.message || "Save failed");
      }

      setProfileFile(null);
      setLogoFile(null);
      setOk("Saved!");
      onSaved && onSaved();
      setTimeout(() => setOk(""), 1200);
    } catch (e) {
      setErr(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = reject;
      r.readAsDataURL(file);
    });

  const onProfileFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCropMode("profile");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    const src = await fileToDataUrl(f);
    setCropImageSrc(src);
    setCropperOpen(true);
  };

  const onLogoFileChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setCropMode("logo");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    const src = await fileToDataUrl(f);
    setCropImageSrc(src);
    setCropperOpen(true);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  const cardData = {
    fullname,
    job_title: jobTitle,
    company_name: companyName,
    phone_number: phoneNumber,
    email,
    profile_photo: profileImageUrl || DEFAULT_AVATAR,
    logo: companyLogoUrl || DEFAULT_LOGO,

    primary_color: primaryColor,
    secondary_color: secondaryColor,
    company_address: companyAddress,
    font_family: fontFamily,
    fontFamily,
    website,
    github,
    linkedin,
  };

  const CardComponentById = {
    1: Template1,
    2: Template2,
    3: Template3,
    4: Template4,
    5: Template5,
    6: Template6,
  };
  const CardComponent = CardComponentById[templateId] || Template1;

  const p = buildTemplateProps(cardData);

  const closeModal = () => {
    if (isTeam) {
      navigate(`/teams/${teamId}`);
    } else {
      navigate("/home");
    }
  };

  const onCropComplete = (_area, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  };

  const objectUrlToFile = async (objUrl, name = "image.jpg") => {
    const blob = await fetch(objUrl).then((r) => r.blob());
    return new File([blob], name, { type: blob.type || "image/jpeg" });
  };

  const handleCropConfirm = async () => {
    if (!cropImageSrc || !croppedAreaPixels || !cropMode) return;

    const objUrl = await getCroppedImg(cropImageSrc, croppedAreaPixels);

    if (cropMode === "profile") {
      setPreviewUrl(setProfileImageUrl, objUrl);
      const f = await objectUrlToFile(objUrl, "profile.jpg");
      setProfileFile(f);
    } else if (cropMode === "logo") {
      setPreviewUrl(setCompanyLogoUrl, objUrl);
      const f = await objectUrlToFile(objUrl, "logo.jpg");
      setLogoFile(f);
    }

    setCropperOpen(false);
    setCropMode(null);
    setCropImageSrc(null);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setCropMode(null);
    setCropImageSrc(null);
  };

  // Navigation helpers
  const goToMyLinks = () => {
    if (!isTeam) {
      navigate(`/edit/mylinks/${cardId}`);
    }
  };

  const goToContactSide = () => {
    if (isTeam) {
      navigate(`/edit/team/${teamId}/member/${memberId}/contact`);
    } else {
      navigate(`/edit/contact/${cardId}`);
    }
  };

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar onSave={saveAll} saving={saving} onClose={closeModal} />

      <div className="flex pt-24 ">
        <Sidebar activePage="Edit Card" />

        <div className="flex-1 px-6 pt-4 h-[calc(100vh-80px)] overflow-hidden">
          {/* alerts */}
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

          {/* body: form + phone */}
          <div className="grid grid-cols-11 gap-4 items-center h-full">
            {/* form (left) */}
            <main className="col-span-11 md:col-span-8 lg:col-span-7 h-full">
              <div className="rounded-2xl bg-white shadow-sm border border-[#d6e6fb]">
                {/* Picture row */}
                <div className="p-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <UploadTile
                    title="Profile Picture"
                    shape="square"
                    previewUrl={profileImageUrl || DEFAULT_AVATAR}
                    onFileChange={onProfileFileChange}
                    helper="PNG/JPG up to 5MB"
                    buttonLabel="Upload"
                  />
          
                  {!isTeam && (
                    <UploadTile
                      title="Company Logo"
                      shape="square"
                      previewUrl={companyLogoUrl || null}
                      onFileChange={onLogoFileChange}
                      helper="Transparent PNG recommended"
                      buttonLabel="Upload"
                    />
                  )}
                  
                </div>

                {/* fields */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LabeledInput
                    label="Name"
                    value={fullname}
                    onChange={setFullname}
                  />
                  <LabeledInput
                    label="Company Address"
                    value={companyAddress}
                    onChange={setCompanyAddress}
                  />
                  <LabeledInput
                    label="Job Title"
                    value={jobTitle}
                    onChange={setJobTitle}
                  />
                  <LabeledInput
                    label="Company"
                    value={companyName}
                    onChange={setCompanyName}
                  />
                  <LabeledInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />
                  <LabeledInput
                    label="Phone"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                  />
                </div>
              </div>
            </main>

            {/* right phone preview */}
            <aside className="col-span-11 md:col-span-4 self-center justify-center">
              {/* keep it visible and start near the top of the page */}
              <div className="md:sticky md:top-24 pr-2">
                {/* perspective on parent */}
                <div
                  className="relative w-full max-w-sm mx-auto"
                  style={{ perspective: "1000px" }}
                >
                  <div className="text-sm text-center mb-2 text-[#0b2447] opacity-80">
                    Click to switch to{" "}
                    {showPhonePreview ? "Card View" : "Phone Preview"}
                  </div>

                  {/* flip container */}
                  <div
                    className="relative w-full h-[520px] cursor-pointer transition-transform duration-700 ease-in-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: showPhonePreview
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                    }}
                    onClick={() => setShowPhonePreview((prev) => !prev)}
                  >
                    {/* FRONT: Card view */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(0deg)",
                      }}
                    >
                      <div className="mx-auto w-[360px] h-[220px] rounded-xl overflow-hidden shadow relative bg-white">
                        <CardComponent
                          {...p}
                          logo={p.logoUrl || p.logo}
                          side="front"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </div>

                    {/* BACK: Phone preview */}
                    <div
                      className="absolute inset-0"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        transformOrigin: "top center",
                      }}
                    >
                      {/* scale down slightly so the entire phone fits */}
                      <div
                        style={{
                          transform: "scale(0.95)",
                          transformOrigin: "top center",
                        }}
                      >
                        <PhonePreview
                          name={p.fullName || "Your Name"}
                          title={p.jobTitle || "Job Title"}
                          company={p.companyName || "Company"}
                          phone={p.phoneNumber || "Phone"}
                          email={p.email || "email@example.com"}
                          avatar={p.profile_photo}
                          logo={p.logoUrl || p.logo}
                          website={website} // ⬅️ add
                          github={github} // ⬅️ add
                          linkedin={linkedin} // ⬅️ add
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
      {cropperOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center">
          <div className="relative w-[300px] h-[300px] bg-white">
            <Cropper
              image={cropImageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              showGrid={true}
            />
            <button
              className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleCropConfirm}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="text-sm text-[#0b2447]">{label}</label>
      <input
        type={type}
        className="w-full border rounded-xl px-3 py-2 mt-1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
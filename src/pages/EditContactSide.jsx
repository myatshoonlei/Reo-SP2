"use client"

import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Cropper from "react-easy-crop"
import getCroppedImg from "../utils/cropImage"   // <-- same util you already have

import Navbar from "../components/Navbar"
import Sidebar from "../components/Sidebar"
import PhonePreview from "../components/PhonePreview"
import UploadTile from "../components/UploadTile"
import Template1 from "../components/templates/Template1"
import Template2 from "../components/templates/Template2"
import Template3 from "../components/templates/Template3"
import Template4 from "../components/templates/Template4"
import Template5 from "../components/templates/Template5"
import Template6 from "../components/templates/Template6"

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000"

const CardComponentById = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
  6: Template6,
}


const FONT_OPTIONS = [
  { label: "System (Inter/Sans)", value: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif` },
  { label: "Neo Grotesk (Helvetica/Arial)", value: `"Helvetica Neue", Helvetica, Arial, "Noto Sans", sans-serif` },
  { label: "Humanist (Segoe/Leelawadee)", value: `"Segoe UI", "Leelawadee UI", Tahoma, Arial, sans-serif` },
  { label: "Rounded (Nunito-like)", value: `"Nunito", -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif` },
  { label: "Compact (Tahoma)", value: `Tahoma, "Segoe UI", Arial, sans-serif` },
  { label: "International (Noto Sans First)", value: `"Noto Sans", "Segoe UI", "Leelawadee UI", Tahoma, Arial, sans-serif` },
  { label: "Old Style Serif (Garamond)", value: `Garamond, "Times New Roman", Times, serif` },
  { label: "Mono (SFMono/Consolas)", value: `"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` },
  { label: "Display (Impact/Haettenschweiler)", value: `Impact, Haettenschweiler, "Arial Narrow Bold", Arial, sans-serif` },
]

export default function EditContactSide() {
  const navigate = useNavigate()
  const { cardId: paramId } = useParams()
  const [cardId, setCardId] = useState(paramId || localStorage.getItem("personal_card_id") || null)

  // token normalization
  const tokenRaw = localStorage.getItem("token")
  const token = tokenRaw && !/^bearer /i.test(tokenRaw) ? `Bearer ${tokenRaw.replace(/^"|"$/g, "")}` : tokenRaw

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")
  const [ok, setOk] = useState("")

  // base card info for preview
  const [fullName, setFullName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")

  // appearance controls
  const [primaryColor, setPrimaryColor] = useState("#1F2937")
  const [secondaryColor, setSecondaryColor] = useState("#f5f9ff")
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0].value)

  // contact-side fields shown in preview
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  // images (live preview urls)
  const [profileUrl, setProfileUrl] = useState(null)
  const [logoUrl, setLogoUrl] = useState(null)

  // pending upload files
  const [profileFile, setProfileFile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [removeProfile, setRemoveProfile] = useState(false)
  const [removeLogo, setRemoveLogo] = useState(false)

  const [templateId, setTemplateId] = useState(1)
  const [showPhonePreview, setShowPhonePreview] = useState(false)

  // ------- cropper state -------
  const [cropperOpen, setCropperOpen] = useState(false)
  const [cropMode, setCropMode] = useState(null) // 'profile' | 'logo'
  const [cropImageSrc, setCropImageSrc] = useState(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // cleanup for blob URLs
  const prevBlobUrls = useRef([])
  const rememberBlob = (url) => url?.startsWith("blob:") && prevBlobUrls.current.push(url)

  useEffect(() => {
    const load = async () => {
      if (!cardId) {
        setErr("No card selected")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        setErr("")


        const baseRes = await fetch(`${API_BASE}/api/personal-card/${cardId}`, {
          headers: { Authorization: token },
        })
        if (!baseRes.ok) throw new Error("Failed to load card")
        const base = await baseRes.json()
        const d = base?.data ?? base

        setFullName(d.fullname ?? "")
        setJobTitle(d.job_title ?? d.jobTitle ?? "")
        setCompanyName(d.company_name ?? d.companyName ?? "")
        setCompanyAddress(d.company_address ?? d.companyAddress ?? "")
        setPrimaryColor(d.primary_color ?? d.primaryColor ?? "#1F2937")
        setSecondaryColor(d.secondary_color ?? d.secondaryColor ?? "#f5f9ff")
        setFontFamily(d.font_family ?? d.fontFamily ?? FONT_OPTIONS[0].value)
        setEmail(d.email ?? "")
        setPhone(d.phone_number ?? d.phoneNumber ?? "")
        setTemplateId(d.template_id ?? d.templateId ?? 1)

        const logoB64 = d.logo || d.logoBase64
        const photoB64 = d.profile_photo || d.profilePhoto
        setLogoUrl(logoB64 ? `data:image/png;base64,${logoB64}` : null)
        setProfileUrl(photoB64 ? `data:image/jpeg;base64,${photoB64}` : null)

        localStorage.setItem("personal_card_id", cardId)

        // also accept legacy component_key
        const tId = Number(d.templateId)
        const keyToId = { template1:1, template2:2, template3:3, template4:4, template5:5, template6:6 }
        const key = (d.component_key ?? d.componentKey ?? "").toString()
        setTemplateId(Number.isFinite(tId) && [1,2,3,4,5,6].includes(tId) ? tId : keyToId[key] || 1)
      } catch (e) {
        setErr(e.message || "Could not load contact side")
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => {
      prevBlobUrls.current.forEach((u) => URL.revokeObjectURL(u))
      prevBlobUrls.current = []
    }
  }, [cardId, token])

  // -------- file helpers --------
  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const r = new FileReader()
      r.onload = () => resolve(r.result)
      r.onerror = reject
      r.readAsDataURL(file)
    })

  const objectUrlToFile = async (objUrl, name = "image.jpg") => {
    const blob = await fetch(objUrl).then((r) => r.blob())
    return new File([blob], name, { type: blob.type || "image/jpeg" })
  }

  // -------- picking images -> open cropper --------
  const onProfileChange = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setRemoveProfile(false)
    setCropMode("profile")
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null)
    setCropImageSrc(await fileToDataUrl(f))
    setCropperOpen(true)
  }

  const onLogoChange = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setRemoveLogo(false)
    setCropMode("logo")
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppedAreaPixels(null)
    setCropImageSrc(await fileToDataUrl(f))
    setCropperOpen(true)
  }

  const onCropComplete = (_area, areaPixels) => setCroppedAreaPixels(areaPixels)

  // confirm crop -> live preview + file for upload
  const handleCropConfirm = async () => {
    if (!cropImageSrc || !croppedAreaPixels || !cropMode) return
    const objUrl = await getCroppedImg(cropImageSrc, croppedAreaPixels) // returns blob: URL
    rememberBlob(objUrl)

    if (cropMode === "profile") {
      setProfileUrl(objUrl)
      setProfileFile(await objectUrlToFile(objUrl, "profile.jpg"))
    } else if (cropMode === "logo") {
      setLogoUrl(objUrl)
      setLogoFile(await objectUrlToFile(objUrl, "logo.jpg"))
    }

    setCropperOpen(false)
    setCropMode(null)
    setCropImageSrc(null)
  }

  const handleCropCancel = () => {
    setCropperOpen(false)
    setCropMode(null)
    setCropImageSrc(null)
  }

  // -------- save (uploads first, then fields) --------
  const saveAll = async () => {
    try {
      setSaving(true)
      setErr("")
      setOk("")

      let cleanToken = tokenRaw
      if (cleanToken?.startsWith('"') && cleanToken?.endsWith('"')) cleanToken = cleanToken.slice(1, -1)
      if (cleanToken && !cleanToken.toLowerCase().startsWith("bearer ")) cleanToken = `Bearer ${cleanToken}`

      const uploads = []
      if (profileFile) {

        const fd = new FormData()
        fd.append("profile", profileFile)
        fd.append("cardId", cardId)
        uploads.push(fetch(`${API_BASE}/api/profile-photo`, { method: "POST", headers: { Authorization: cleanToken }, body: fd }))
      }
      if (logoFile) {

        const fd = new FormData()
        fd.append("logo", logoFile)
        fd.append("cardType", "Myself")
        fd.append("cardId", cardId)
        uploads.push(fetch(`${API_BASE}/api/upload-logo`, { method: "POST", headers: { Authorization: cleanToken }, body: fd }))
      }

      if (uploads.length) {

        const resArr = await Promise.all(uploads)
        const bad = resArr.find((r) => !r.ok)
        if (bad) {

          const j = await bad.json().catch(() => ({}))
          throw new Error(j?.error || j?.message || `Upload failed (${bad.status})`)
        }

      }

      const basePayload = {
        fullname: fullName,
        job_title: jobTitle,
        company_name: companyName,
        company_address: companyAddress,
        phone_number: phone,
        email,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
        clearLogo: removeLogo,
        clearProfile: removeProfile,
      }



      const baseRes = await fetch(`${API_BASE}/api/personal-card/${cardId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: cleanToken },
        body: JSON.stringify(basePayload),
      })


      
      if (!baseRes.ok) {
        const errorText = await baseRes.text().catch(() => "")
        let message = `Save failed (${baseRes.status})`
        if (errorText) {
          try { message = JSON.parse(errorText)?.error || JSON.parse(errorText)?.message || message }
          catch { if (errorText.length < 120) message = errorText }
        }
        throw new Error(message)
      }


      setOk("Saved!")
      setTimeout(() => setOk(""), 1200)
      setProfileFile(null)
      setLogoFile(null)

      setRemoveProfile(false)
      setRemoveLogo(false)
    } catch (e) {

      setErr(e.message || "Save failed")
    } finally {
      setSaving(false)
    }
  }

  const closeModal = () => navigate("/home", { state: { updatedCard: true } })

  if (loading) {
    return (
      <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
        <Navbar onSave={saveAll} saving={saving} onClose={closeModal} />
        <div className="pt-24 p-6 text-slate-600">Loading…</div>
      </div>
    )
  }

  const CardComponent = CardComponentById[templateId] || Template1
  

  const cardProps = {
    fullName,
    jobTitle,
    companyName,
    company_address: companyAddress,
    phoneNumber: phone,
    email,
    profile_photo: removeProfile ? null : profileUrl,
    logo: removeLogo ? null : logoUrl,               // live preview (blob) wins
    primary_color: primaryColor,
    secondary_color: secondaryColor,
    font_family: fontFamily,
    fontFamily,
    sizeName: 22,
    sizeTitle: 16,
    sizeCompany: 15,
    sizeEmail: 13,
    sizePhone: 14,
    sizeAddress: 12,
  }


  const phonePreviewProps = {
    name: fullName || "Your Name",
    title: jobTitle || "Job Title",
    company: companyName || "Company",
    phone: phone || "Phone",
    email: email || "email@example.com",
    avatar: removeProfile ? null : profileUrl,
    logo: removeLogo ? null : logoUrl,               // live preview too
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar onSave={saveAll} saving={saving} onClose={closeModal} />

      <div className="flex pt-24">
        <Sidebar />

        <div className="flex-1 px-6 pt-4 h-[calc(100vh-80px)] overflow-hidden">
          {(err || ok) && (
            <div className="pt-3">
              {err && <div className="mb-2 p-2 rounded bg-red-50 text-red-700">{err}</div>}
              {ok && <div className="mb-2 p-2 rounded bg-green-50 text-green-700">{ok}</div>}
            </div>
          )}

          <div className="grid grid-cols-11 gap-4 items-start h-full">

            <main className="col-span-11 md:col-span-8 lg:col-span-7 space-y-4">
              <div className="rounded-2xl bg-white shadow-sm border border-[#d6e6fb] overflow-hidden">

                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold text-[#0b2447]">Contact Side Appearance</h2>
                  <p className="text-sm text-slate-500">Fonts, colors, and images for your contact side.</p>
                </div>


                <div className="p-4 border-b grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <UploadTile
                      title="Profile Photo"
                      shape="square"
                      previewUrl={!removeProfile ? profileUrl : null}
                      onFileChange={onProfileChange}
                      helper="PNG/JPG up to 5MB"
                      buttonLabel="Upload"
                    />
                    <button
                      type="button"
                      className="mt-2 text-sm px-3 py-1.5 border rounded-lg hover:bg-[#f2f7fd]"
                      onClick={() => {
                        setRemoveProfile(true)
                        setProfileFile(null)
                        setProfileUrl(null)
                      }}
                    >
                      Remove Profile Photo
                    </button>
                  </div>

                  <div>
                    <UploadTile
                      title="Company Logo"
                      shape="square"
                      previewUrl={!removeLogo ? logoUrl : null}
                      onFileChange={onLogoChange}
                      helper="Transparent PNG recommended"
                      buttonLabel="Upload"
                    />
                    <button
                      type="button"
                      className="mt-2 text-sm px-3 py-1.5 border rounded-lg hover:bg-[#f2f7fd]"
                      onClick={() => {
                        setRemoveLogo(true)
                        setLogoFile(null)
                        setLogoUrl(null)
                      }}
                    >
                      Remove Logo
                    </button>
                  </div>
                </div>


                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#0b2447]">Primary Color</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input type="color" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="h-10 w-14 p-0 border rounded" />
                      <input type="text" value={primaryColor} onChange={(e)=>setPrimaryColor(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-[#0b2447]">Background Color</label>
                    <div className="mt-1 flex items-center gap-3">
                      <input type="color" value={secondaryColor} onChange={(e)=>setSecondaryColor(e.target.value)} className="h-10 w-14 p-0 border rounded" />
                      <input type="text" value={secondaryColor} onChange={(e)=>setSecondaryColor(e.target.value)} className="flex-1 border rounded-lg px-3 py-2" />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-sm text-[#0b2447]">Font Style</label>
                    <select className="mt-1 w-full border rounded-xl px-3 py-2" value={fontFamily} onChange={(e)=>setFontFamily(e.target.value)}>
                      {FONT_OPTIONS.map((f)=>(
                        <option key={f.label} value={f.value}>{f.label}</option>
                      ))}
                    </select>

                  </div>
                </div>
              </div>
            </main>


            <aside className="col-span-11 md:col-span-4 self-center justify-center">

              <div className="md:sticky md:top-24 pr-2">

                <div className="relative w-full max-w-sm mx-auto" style={{ perspective: "1000px" }}>
                  <div className="text-sm text-center mb-2 text-[#0b2447] opacity-80">
                    Click to switch to {showPhonePreview ? "Card View" : "Phone Preview"}
                  </div>


                  <div
                    className="relative w-full h-[520px] cursor-pointer transition-transform duration-700 ease-in-out"
                    style={{ transformStyle: "preserve-3d", transform: showPhonePreview ? "rotateY(180deg)" : "rotateY(0deg)" }}
                    onClick={() => setShowPhonePreview((prev) => !prev)}
                  >
                    <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(0deg)" }}>
                      <div className="mx-auto w-[360px] h-[220px] rounded-xl overflow-hidden shadow relative bg-white" style={{ fontFamily }}>
                        <CardComponent  {...cardProps} side="front" style={{ width: "100%", height: "100%" }} />
                      </div>
                    </div>

                    <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", transformOrigin: "top center" }}>
                      <div style={{ transform: "scale(0.95)", transformOrigin: "top center" }}>
                        <PhonePreview {...phonePreviewProps}  />
                      </div>
                    </div>
                  </div>
                </div>


                <div className="mt-3 flex items-center gap-3 justify-center">
                  <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <span className="inline-block w-4 h-4 rounded" style={{ background: primaryColor }} />
                    Primary
                  </span>
                  <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                    <span className="inline-block w-4 h-4 rounded border" style={{ background: secondaryColor }} />
                    Background
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Cropper modal */}
      {cropperOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center">
          <div className="relative w-[320px] h-[360px] bg-white rounded-lg p-3">
            <div className="relative w-full h-[260px]">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid
              />
            </div>
            <div className="mt-3 flex gap-2 justify-end">
              <button className="px-3 py-1.5 rounded border" onClick={handleCropCancel}>Cancel</button>
              <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={handleCropConfirm}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
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
  )
}

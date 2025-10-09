"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import Template1 from "./templates/Template1"
import Template2 from "./templates/Template2"
import Template3 from "./templates/Template3"
import Template4 from "./templates/Template4"
import Template5 from "./templates/Template5"
import Template6 from "./templates/Template6"
// import TemplateVmes from "./templates/TemplateVmes"

import { getLogoSrc } from "../utils/logoUtils"
import { compressImage, fileToBase64 } from "../utils/imageUtils"

export default function TemplateSelectionModal() {
  const navigate = useNavigate()
  const location = useLocation()
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
  const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin

  const [userData, setUserData] = useState(null)
  const [templates, setTemplates] = useState([])
  const [cardInfo, setCardInfo] = useState(null)
  const [loadingCard, setLoadingCard] = useState(true)
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState(null)

  // ✅ NEW: hold QR as data URL
  const [qrDataUrl, setQrDataUrl] = useState(null)

  // --- utils
  const sanitizeColor = (color) => {
    if (!color) return "#000000"
    return String(color).replace(/^['"]+|['"]+$/g, "")
  }

  const getFlowType = () => {
    const stored = (localStorage.getItem("card_type") || localStorage.getItem("flow_type") || "").toLowerCase()
    if (stored === "team" || stored === "myself") return stored

    const hasTeamId = !!localStorage.getItem("team_card_id")
    const hasPersonalId = !!localStorage.getItem("personal_card_id")
    if (hasTeamId && !hasPersonalId) return "team"
    return "myself"
  }

  const getTeamId = () =>
    location.state?.teamId ||
    (() => {
      const raw = localStorage.getItem("team_card_id")
      return raw && raw !== "null" && raw !== "undefined" ? Number(raw) : null
    })()

  const getEffectiveCardId = () => {
    const raw = localStorage.getItem("personal_card_id")
    return raw && raw !== "null" && raw !== "undefined" ? Number(raw) : null
  }

  // --- fetch templates
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/api/templates`)
        if (!res.ok) throw new Error("Failed to fetch templates")
        setTemplates(await res.json())
      } catch (e) {
        console.error("❌ Template fetch failed:", e)
        setTemplates([])
      } finally {
        setLoadingTemplates(false)
      }
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      const token = localStorage.getItem("token")
      if (!token) return navigate("/login")

      const flow = getFlowType()

      try {
        if (flow === "team") {
          const teamId = getTeamId()
          if (!teamId) throw new Error("Missing teamId for team flow")

          const [teamRes, memberRes] = await Promise.all([
            fetch(`${API_URL}/api/teamcard/${teamId}/details`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/api/teamInfo/first?teamId=${teamId}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ])
          if (!teamRes.ok) throw new Error("Failed to fetch team card details")
          if (!memberRes.ok) throw new Error("Failed to fetch first team member")

          const team = (await teamRes.json()).data
          const member = (await memberRes.json()).data

          setCardInfo({
            id: member?.id,
            team_id: team?.teamid,
            fullname: member?.fullname || "Member Name",
            job_title: member?.job_title || "Title",
            company_name: team?.company_name || member?.company_name || "Company",
            email: member?.email || "email@example.com",
            phone_number: member?.phone_number || "123-456-7890",
            company_address: member?.company_address || team?.company_address || "",
            logo: getLogoSrc(team?.logo) || "/default-logo.png",
            primary_color: sanitizeColor(team?.primary_color),
            secondary_color: sanitizeColor(team?.secondary_color),
            qr: member?.qr || qrDataUrl,
          })
        } else {
          const res = await fetch(`${API_URL}/api/personal-card/details`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          let data
          if (res.ok) {
            data = await res.json()
          } else {
            const alt = await fetch(`${API_URL}/api/personal-card/all`, {
              headers: { Authorization: `Bearer ${token}` },
              cache: "no-store",
            })
            const arr = alt.ok ? await alt.json() : []
            data = Array.isArray(arr) && arr.length ? arr[0] : {}
          }

          setCardInfo({
            id: data?.id,
            fullname: data?.fullname || "Name",
            job_title: data?.job_title || "Title",
            company_name: data?.company_name || "Company",
            email: data?.email || "email@example.com",
            phone_number: data?.phone_number || "123-456-7890",
            company_address: data?.company_address || "",
            logo: getLogoSrc(data?.logo) || "/default-logo.png",
            primary_color: sanitizeColor(data?.primary_color),
            secondary_color: sanitizeColor(data?.secondary_color),
          })
        }
      } catch (e) {
        console.error("❌ Building preview failed:", e)
        setCardInfo({
          fullname: "Name",
          job_title: "Title",
          company_name: "Company",
          email: "email@example.com",
          phone_number: "123-456-7890",
          logo: "/default-logo.png",
          primary_color: "#000000",
          secondary_color: "#ffffff",
        })
      } finally {
        setLoadingCard(false)
      }
    })()
  }, [navigate, location])

  // ---------- QR generation (works for both flows) ----------
  useEffect(() => {
    const flow = getFlowType()
    const make = async () => {
      try {
        const { default: QRCode } = await import("qrcode")
        let url

        if (flow === "team") {
          if (!cardInfo?.team_id || !cardInfo?.id) return
          if (cardInfo?.qr) {
            setQrDataUrl(cardInfo.qr)
            return
          }
          url = `${BASE}/api/teamInfo/public/${cardInfo.team_id}/member/${cardInfo.id}`
        } else {
          if (cardInfo?.qr) {
            setQrDataUrl(cardInfo.qr)
            return
          }
          url = `${BASE}/card/${cardInfo.id}`
        }

        const dataUrl = await QRCode.toDataURL(url, { width: 160, margin: 0 })
        setQrDataUrl(dataUrl)
      } catch (e) {
        console.warn("QR generation failed:", e)
        setQrDataUrl(null)
      }
    }
    make()
  }, [cardInfo?.id, cardInfo?.team_id, cardInfo?.qr, location])

  const ready = !loadingCard && !loadingTemplates

  if (!ready) {
    return (
      <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
        <div className="bg-white rounded-xl p-8 shadow-xl">Loading…</div>
      </div>
    );
  }

  const templateMap = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
    // templatevmes: TemplateVmes,
  }

  const goBack = () => {
    const flow = getFlowType()
    if (flow === "team") {
      navigate("/create/upload-info")
    } else {
      navigate("/create/background-color")
    }
  }

  const handleNext = async () => {
    if (!selectedTemplate) return

    const token = localStorage.getItem("token")
    if (!token) {
      navigate("/login")
      return
    }

    let compressedLogo = cardInfo.logo
    if (compressedLogo && compressedLogo.startsWith("data:image/")) {
      try {
        const blob = await (await fetch(compressedLogo)).blob()
        if (blob.size > 100000) {
          const compressedBlob = await compressImage(blob, 200, 0.7)
          compressedLogo = `data:image/jpeg;base64,${await fileToBase64(compressedBlob)}`
        }
      } catch (e) {
        console.warn("[v0] Logo compression failed:", e)
      }
    }

    const templateKey = templates.find((t) => t.id === selectedTemplate)?.component_key || "template1"

    const flow = getFlowType()

    try {
      if (flow === "team") {
        const teamId = getTeamId()
        if (!teamId) throw new Error("Missing teamId for team flow")
        await fetch(`${API_URL}/api/teamcard/${teamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            template_id: selectedTemplate,
            primaryColor: cardInfo.primary_color,
            secondaryColor: cardInfo.secondary_color,
          }),
        })

        await fetch(`${API_URL}/api/teamInfo/${teamId}/qrs`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        })

        const freshRes = await fetch(`${API_URL}/api/teamInfo/first?teamId=${teamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const freshMember = (await freshRes.json()).data
        navigate("/create/preview", {
          state: {
            cardType: "team",
            teamId,
            templateKey,
            card: {
              id: freshMember.id,
              fullname: freshMember.fullname,
              job_title: freshMember.job_title,
              company_name: cardInfo.company_name,
              email: freshMember.email,
              phone_number: freshMember.phone_number,
              company_address: freshMember.company_address || cardInfo.company_address || "",
              primary_color: cardInfo.primary_color,
              secondary_color: cardInfo.secondary_color,
              logo: compressedLogo,
              qr: freshMember.qr,
            },
          },
        })

        return
      }
      const payload = {
        id: cardInfo.id,
        fullname: cardInfo.fullname,
        email: cardInfo.email,
        companyName: cardInfo.company_name,
        jobTitle: cardInfo.job_title,
        phoneNumber: cardInfo.phone_number,
        companyAddress: cardInfo.company_address,
        template_id: selectedTemplate,
        primaryColor: cardInfo.primary_color,
        secondaryColor: cardInfo.secondary_color,
        logo: compressedLogo,
        qr: qrDataUrl,

        

      }


      const res = await fetch(`${API_URL}/api/personal-card`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);

      navigate("/create/preview", {
        state: {
          fromSave: true,
          card: payload,
          templateKey,
          cardId: cardInfo.id,
          primaryColor: cardInfo.primary_color,
          secondaryColor: cardInfo.secondary_color,
          croppedLogo: compressedLogo,
          qr: qrDataUrl,
          
        },
      })
    } catch (e) {
      console.error("❌ Error saving card", e)
    }
  }

  // Filter templates to only show those with a corresponding component
  const availableTemplates = templates.filter(
    (t) => templateMap[t.component_key]
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm transition-opacity duration-300">
      <div className="bg-white rounded-xl p-8 shadow-xl w-[90vw] max-w-[1200px] max-h-[90vh] flex flex-col">
        <h2 className="font-semibold text-gray-600 text-sm mb-1 text-center">Step 5</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-1 text-center">Choose a template for Your Business Card</h3>
        <p className="text-xs text-gray-500 mb-4 text-center">Pick a template. You can also customize it later.</p>

        <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-2 pb-4 mt-10">
        {availableTemplates.map((t) => { // Use the filtered array here
            const T = templateMap[t.component_key];
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`cursor-pointer rounded-xl border flex items-center justify-center 
                  transition-all duration-200 
                  ${selectedTemplate === t.id
                    ? "border-blue-500 shadow-lg bg-blue-200 "
                    : "border-gray-300 hover:border-blue-400 hover:shadow-md hover:scale-105"
                  }`}
              >
                {T && cardInfo && <T {...cardInfo} companyAddress={cardInfo.company_address} />}
              </div>
            )
          })}
        </div>

        <div className="pt-2 flex justify-between">
          <button
            onClick={goBack}
            className="border border-[#0B2447] text-[#0B2447] px-6 py-2 rounded hover:bg-[#e7edf6]"
          >
            ← Previous
          </button>
          <button
            disabled={!selectedTemplate}
            onClick={handleNext}
            className={`px-6 py-2 rounded ${
              selectedTemplate
                ? "bg-[#0B2447] text-white hover:bg-[#132a58]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

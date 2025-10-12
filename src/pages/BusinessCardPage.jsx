import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Phone, Mail, Download, Building, ImageDown, User, CheckCircle, Info, AlertTriangle, X } from "lucide-react";
import { toPng } from 'html-to-image';
import ReactDOM from 'react-dom/client';

// --- TEMPLATE COMPONENTS ---
// Importing your actual template components from their files.
// Please adjust the path if it's different in your project structure.
import Template1 from '../components/templates/Template1';
import Template2 from '../components/templates/Template2';
import Template3 from '../components/templates/Template3';
import Template4 from '../components/templates/Template4';
import Template5 from '../components/templates/Template5';
import Template6 from '../components/templates/Template6';
import TemplateVmes from "../components/templates/TemplateVmes";


// Maps template names from the database to the actual imported React components.
// The names ('Template1', 'Template2') should match what's stored in your database.
const templateMap = {
    Template1, Template2, Template3, Template4, Template5, Template6, TemplateVmes,
    template1: Template1, template2: Template2, template3: Template3,
    template4: Template4, template5: Template5, template6: Template6,
    templatevmes: TemplateVmes, templatemves: TemplateVmes, // Add variations for the template name
};


const preloadImage = (src) =>
    new Promise((res) => {
        if (!src) return res();
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "sync";
        img.onload = () => res();
        img.onerror = () => res(); // don't hang
        img.src = src;
    });

const waitForAllImages = (rootEl) =>
    Promise.all(
        Array.from(rootEl.querySelectorAll("img")).map((img) => {
            if (img.complete && img.naturalWidth) return;
            return new Promise((r) => {
                img.onload = () => r();
                img.onerror = () => r();
            });
        })
    );


const BusinessCardPage = () => {


    const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    // 👇 accept BOTH personal and team url params
    const { id, teamId, memberId } = useParams();

    const navigate = useNavigate();

    const [card, setCard] = useState(null);
    const [isMobileDevice, setIsMobileDevice] = useState(false);
    const [isOwner, setIsOwner] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAlreadySaved, setIsAlreadySaved] = useState(false); // New state to track if contact is saved
    const [isSaving, setIsSaving] = useState(false); // New state for loading feedback

    const [notice, setNotice] = useState(null); // string | null

    const showNotice = (message, type = "info", title) =>
        setNotice({ message, type, title });
    const closeNotice = () => setNotice(null);

    useEffect(() => {
        // detect device + auth once
        setIsMobileDevice(/Mobi|Android/i.test(navigator.userAgent));
        const rawToken = localStorage.getItem("token");
        const token = rawToken ? rawToken.replace(/"/g, "") : "";
        setIsLoggedIn(!!token);


        async function fetchPersonal(cardId) {

            // Send auth token if it exists so the backend can check ownership
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            const res = await fetch(`${API_URL}/api/card/${cardId}`, { headers });
            if (!res.ok) throw new Error("Card not found");
            const data = await res.json();

            setCard(data.card);                 // same shape you already use
            setIsOwner(data.isOwner);
            setIsAlreadySaved(data.isAlreadySaved);

            // cache flag for quick UI
            localStorage.setItem(`saved_card_${cardId}`, data.isAlreadySaved ? "1" : "0");
        }

        async function fetchTeam(tIdRaw, mIdRaw) {
            const tId = String(tIdRaw).replace(/[^\d]/g, "");
            const mId = String(mIdRaw).replace(/[^\d]/g, "");
            const url = `${API_URL}/api/teamInfo/public/${tId}/member/${mId}`;

            const res = await fetch(url);
            if (res.status === 404) {
                setNotice("This team member link doesn't exist or was deleted.", "error", "Not Found");
                return;
            }
            if (!res.ok) {
                throw new Error(`Fetch failed (${res.status})`);
            }

            const { data } = await res.json();
            const normalized = {
                id: data.id,
                team_id: data.team_id,
                fullname: data.fullname,
                email: data.email,
                company_name: data.company_name,
                job_title: data.job_title,
                phone_number: data.phone_number,
                qr: data.qr || null,
                template: data.component_key || "template1",
                primary_color: data.primary_color,
                secondary_color: data.secondary_color,
                logo: data.logo ? `data:image/png;base64,${data.logo}` : null,
                kind: "team",
            };

            setCard(normalized);
            setIsOwner(false);

            const savedKey = `saved_team_${tId}_${mId}`;
            setIsAlreadySaved(localStorage.getItem(savedKey) === "1");
        }

        (async () => {
            try {
                if (id) {
                    // /card/:id
                    await fetchPersonal(id);
                } else if (teamId && memberId) {
                    // /team/:teamId/member/:memberId
                    await fetchTeam(teamId, memberId);
                }
            } catch (err) {
                console.error("Error loading card:", err);
            }
        })();
    }, [id, teamId, memberId]);


    const handleSaveToReo = async () => {
        if (!isLoggedIn) {
            alert("Please log in or create an account to save contacts.");
            navigate('/login');
            return;
        }
        if (!card) return;

        setIsSaving(true);
        const token = (localStorage.getItem("token") || "").replace(/"/g, "");

        const body =
            card.kind === "team"
                ? { memberCardId: card.id } // for team member
                : { contactCardId: card.id }; // for personal card

        try {
            const res = await fetch(`${API_URL}/api/contacts/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(body),
            });

            if (res.status === 201) {
                // newly saved
                setIsAlreadySaved(true);
                localStorage.setItem(`saved_card_${card.id}`, "1");
                showNotice(`${card.fullname} has been added to your contacts!`, "success", "Saved");
                return;
            }

            if (res.status === 409) {
                // already saved — show nice notice, keep disabled
                setIsAlreadySaved(true);
                localStorage.setItem(`saved_card_${card.id}`, "1");
                showNotice("This contact is already in your contacts.", "info", "Already Saved");
                return;
            }

            // any other error: show server message if present
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Could not save contact.");
        } catch (err) {
            // console.error("Error saving to Reo:", err);
            showNotice("You cannot save your own card.", "error", "Oops");
        } finally {
            setIsSaving(false);
        }
    };


    const handleSaveContact = () => {
        if (!card) return;
        const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${card.fullname}
ORG:${card.company_name}
TITLE:${card.job_title}
TEL;TYPE=WORK,VOICE:${card.phone_number}
EMAIL:${card.email}
END:VCARD`;
        const blob = new Blob([vCard], { type: "text/vcard;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${card.fullname}.vcf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Helper function to show image overlay when other methods fail
    const showImageOverlay = (imageData, fileName) => {
        const overlay = document.createElement('div');
        overlay.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 99999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
            <div style="background: white; border-radius: 10px; padding: 20px; max-width: 90%; max-height: 80%; overflow: auto; text-align: center;">
                <h3 style="margin: 0 0 15px 0; color: #333;">Your Business Card</h3>
                <img src="${imageData}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;">
                <p style="margin: 15px 0; color: #666; font-size: 14px;">Long press the image and select "Save to Photos" or "Download Image"</p>
                <button id="closeOverlay" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;

        document.body.appendChild(overlay);

        // Add close functionality
        overlay.querySelector('#closeOverlay').onclick = () => {
            document.body.removeChild(overlay);
        };

        // Close on background click
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        };
    };

    const handleSaveBusinessCard = async () => {
  if (!card || !card.template) {
    alert("Card data or template is missing.");
    return;
  }

  const TemplateComponent = templateMap[card.template];
  if (!TemplateComponent) {
    alert(`Template "${card.template}" not found.`);
    return;
  }

  // Create hidden container
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.top = "-9999px";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const root = ReactDOM.createRoot(container);
  const LOGICAL_W = 350;
  const LOGICAL_H = 200;

  root.render(
    <>
      <div id="card-front-capture" style={{ width: LOGICAL_W, height: LOGICAL_H, background: "white" }}>
        <TemplateComponent {...card} side="front" />
      </div>
      <div id="card-back-capture" style={{ width: LOGICAL_W, height: LOGICAL_H, background: "white", marginTop: "20px" }}>
        <TemplateComponent {...card} side="back" />
      </div>
    </>
  );

  await new Promise(resolve => setTimeout(resolve, 500));

  const frontEl = container.querySelector("#card-front-capture");
  const backEl = container.querySelector("#card-back-capture");

  const captureOptions = {
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    cacheBust: true,
  };

  const [frontDataUrl, backDataUrl] = await Promise.all([
    toPng(frontEl, captureOptions),
    toPng(backEl, captureOptions),
  ]);

  const loadImg = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const [frontImg, backImg] = await Promise.all([
    loadImg(frontDataUrl),
    loadImg(backDataUrl),
  ]);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const GAP = 30;

  canvas.width = Math.max(frontImg.width, backImg.width);
  canvas.height = frontImg.height + backImg.height + GAP;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const frontX = (canvas.width - frontImg.width) / 2;
  const backX = (canvas.width - backImg.width) / 2;

  ctx.drawImage(frontImg, frontX, 0);
  ctx.drawImage(backImg, backX, frontImg.height + GAP);

  const finalDataUrl = canvas.toDataURL("image/png");
  const fileName = `${(card.fullname || "card").replace(/[^a-zA-Z0-9]/g, "_")}_business_card.png`;

  const link = document.createElement("a");
  link.href = finalDataUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  root.unmount();
  document.body.removeChild(container);
};


    if (!card) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gray-100">
                <p className="text-center text-gray-500">Loading card...</p>
            </div>
        );
    }

    const getSaveButtonContent = () => {
        if (isOwner) return "This is Your Card";
        if (isAlreadySaved) return <> Saved to Contacts</>;
        if (isSaving) return "Saving...";
        return <> Save Card to Reo</>;
    };

    // Build the list of actions dynamically
    const actions = [
        { label: card.phone_number, href: `tel:${card.phone_number}`, Icon: Phone, type: 'link', dark: true, iconColor: "text-[#1F2937]" },
        { label: card.email, href: `mailto:${card.email}`, Icon: Mail, type: 'link', dark: true, iconColor: "text-[#1F2937]" },
        {
            label: 'Save Contact',
            onClick: handleSaveContact,
            Icon: User,
            type: 'button',
            dark: true,
            iconColor: "text-[#1F2937]",

            disabled: !isMobileDevice
        },
        { label: 'Save Business Card', onClick: handleSaveBusinessCard, Icon: ImageDown, type: 'button', dark: true, iconColor: "text-[#1F2937]" },
    ];


    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F1F7FE] to-[#DDEBFA] px-4 py-20 flex flex-col justify-center items-center font-sans">
            <div className="w-full max-w-md mx-auto">
                <div className="rounded-3xl border border-white/80 bg-white/70 shadow-lg p-4 mb-4 text-center">

                    {card.profile_photo ? (
                        <img
                            src={`${card.profile_photo}`}
                            alt={card.fullname}
                            className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-md mx-auto -mt-16"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-md mx-auto -mt-16 bg-gray-300 flex items-center justify-center text-white font-semibold text-3xl">
                            {(card.fullname || "C").charAt(0).toUpperCase()}
                        </div>
                    )}
                    {/* <img
                        src={card.profile_photo || "https://via.placeholder.com/96"}
                        alt={card.fullname}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white/80 shadow-md mx-auto -mt-16"
                    /> */}
                    <h1 className="text-2xl font-bold text-[#1e2a3a] mt-4">{card.fullname}</h1>
                    <p className="text-md text-[#5f748d]">{card.job_title}</p>
                    <div className="flex items-center justify-center gap-2 mt-2 text-[#5f748d]">
                        <Building size={16} />
                        <span className="font-semibold">{card.company_name}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* 👇 Destructure the new 'disabled' property */}
                    {actions.map(({ label, href, Icon, iconColor, onClick, type, dark, disabled }, i) => {
                        const content = (
                            // 👇 Add a helpful tooltip and opacity for disabled state
                            <div
                                title={disabled ? "Only available on mobile devices" : ""}
                                className={`rounded-xl p-2 mb-2 flex items-center justify-between border ${dark ? "bg-transparent border-white/60" : "bg-white/70 border-white/80"} ${i % 2 !== 0 ? 'flex-row-reverse' : ''} gap-1 ${disabled ? "opacity-50" : ""}`}
                            >
                                <div className={`flex-1 h-8 rounded-lg transition-transform transform px-3 flex items-center justify-center text-base font-semibold ${dark ? "bg-[#1F2937] text-white" : "bg-white text-[#1F2937] border border-slate-200"} ${!disabled && "hover:bg-opacity-90 hover:scale-105"}`}>
                                    {label}
                                </div>
                                <div className={`flex items-center justify-center rounded-lg w-8 h-8 ${dark ? "bg-white/10" : "bg-[#EDF2F7] border border-white/70"}`}>
                                    <Icon
                                        strokeWidth={2.5}
                                        className={`${iconColor} w-4 h-4`}
                                    />
                                </div>
                            </div>
                        );

                        if (type === 'link') {
                            return <a key={label} href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
                        }

                        // 👇 Only attach onClick if not disabled, and change cursor style
                        return (
                            <div
                                key={label}
                                onClick={disabled ? null : onClick}
                                className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>
                <div className="text-center mt-6 mb-1">
                    <button
                        onClick={handleSaveToReo}
                        disabled={isOwner || isAlreadySaved || isSaving}
                        className="bg-[#1F2937] text-white font-semibold py-3 px-6 rounded-full shadow-lg hover:bg-opacity-90 transition-transform transform hover:scale-105  disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        {getSaveButtonContent()}
                    </button>
                </div>

                {notice && (
                    <div
                        className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                        onClick={closeNotice} // click backdrop to close
                    >
                        <div
                            className="w-[22rem] rounded-2xl bg-white shadow-2xl border border-slate-100 p-5 animate-[pop_200ms_ease-out] relative"
                            onClick={(e) => e.stopPropagation()} // don't close when clicking the card
                        >
                            {/* Close */}
                            <button
                                onClick={closeNotice}
                                aria-label="Close"
                                className="absolute right-3 top-3 rounded-full p-1 hover:bg-slate-100 transition"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>

                            {/* Icon + Title */}
                            <div className="flex items-center gap-3 mb-2">
                                {notice.type === "success" && (
                                    <div className="rounded-full p-2 bg-green-50">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                )}
                                {notice.type === "error" && (
                                    <div className="rounded-full p-2 bg-red-50">
                                        <AlertTriangle className="w-6 h-6 text-red-600" />
                                    </div>
                                )}
                                {(!notice.type || notice.type === "info") && (
                                    <div className="rounded-full p-2 bg-blue-50">
                                        <Info className="w-6 h-6 text-blue-600" />
                                    </div>
                                )}
                                <h3 className="text-lg font-semibold text-slate-800">
                                    {notice.title ?? (notice.type === "success" ? "Success"
                                        : notice.type === "error" ? "Something went wrong" : "Heads up")}
                                </h3>
                            </div>

                            {/* Message */}
                            <p className="text-slate-600 mb-4">
                                {notice.message}
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={closeNotice}
                                    autoFocus
                                    className={[
                                        "px-4 py-2 rounded-lg font-medium transition shadow-sm",
                                        notice.type === "success" && "bg-green-600 text-white hover:bg-green-700",
                                        notice.type === "error" && "bg-red-600 text-white hover:bg-red-700",
                                        (!notice.type || notice.type === "info") && "bg-slate-900 text-white hover:bg-slate-800"
                                    ].join(" ")}
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default BusinessCardPage;
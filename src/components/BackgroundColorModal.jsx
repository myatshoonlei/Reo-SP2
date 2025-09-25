import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ColorThief from "colorthief";
import { SketchPicker } from "react-color";

let persistedSecondaryColor = null;
let persistedSecondaryCustomColor = { r: 0, g: 0, b: 0, a: 1 };

export default function BackgroundColorModal() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const navigate = useNavigate();
  const location = useLocation();

  // State passed from Step 3
  const {
    cardType,
    cardId,
    teamId,
    croppedLogo,        // optional here since you also fetch from /api/logo
    primaryColor,       // for passing forward to next step
  } = location.state || {};

  const [colors, setColors] = useState([]);
  const imgRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(persistedSecondaryCustomColor);
  const [selectedColor, setSelectedColor] = useState(persistedSecondaryColor);

  const getEffectiveCardId = () => {
    if (cardId) return cardId;
    const stored = localStorage.getItem("personal_card_id");
    return stored && stored !== "null" && stored !== "undefined" ? Number(stored) : null;
  };
  const getEffectiveTeamId = () => {
    if (teamId) return teamId;
    const stored = localStorage.getItem("team_card_id");
    return stored && stored !== "null" && stored !== "undefined" ? Number(stored) : null;
  };
  const effectiveCardId = getEffectiveCardId();
  const effectiveTeamId = getEffectiveTeamId();

  useEffect(() => {
    // Persist flow + ids so back/forward doesn't lose them
    if (cardType) localStorage.setItem("card_type", cardType);           // "Myself" | "Team"
    if (cardId != null) localStorage.setItem("personal_card_id", String(cardId));
    if (teamId != null) localStorage.setItem("team_card_id", String(teamId));
  }, [cardType, cardId, teamId]);


  useEffect(() => {
    // Bring back previous background palette / selection
    const savedPalette = localStorage.getItem("secondaryPalette");
    if (savedPalette) setColors(JSON.parse(savedPalette));

    const savedColor = localStorage.getItem("secondaryColor");
    const savedCustom = localStorage.getItem("customSecondaryColor");
    if (savedColor) setSelectedColor(savedColor);
    if (savedCustom) setCustomColor(JSON.parse(savedCustom));

    // helper: blob -> data URL
    const blobToDataURL = (blob) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

    const fetchLogoAndExtractColors = async () => {
      try {
        let dataUrl = null;

        // 1) If Step 3 passed a data URL, use it
        if (typeof croppedLogo === "string" && croppedLogo.startsWith("data:")) {
          dataUrl = croppedLogo;
        }

        // 2) Local cache from Step 2/3
        if (!dataUrl) {
          const cached = localStorage.getItem("last_logo_preview"); // data URL
          if (cached && cached.startsWith("data:")) dataUrl = cached;
        }

        // 3) (Optional) Backend fallback — only if you truly have such an endpoint.
        // Replace this with your real one if needed. Commented out to avoid 404 spam.
        /*
        if (!dataUrl) {
          const token = localStorage.getItem("token");
          const res = await fetch("http://localhost:5000/api/get-logo/<put-id-here>", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const blob = await res.blob();
            if (blob && blob.size > 0) dataUrl = await blobToDataURL(blob);
          }
        }
        */

        if (!dataUrl) {
          console.warn("No logo available for secondary color extraction.");
          return;
        }

        // Persist for consistency (Step 2/3 can also read this)
        localStorage.setItem("last_logo_preview", dataUrl);

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = dataUrl;

        img.onload = () => {
          const colorThief = new ColorThief();
          try {
            const palette = colorThief.getPalette(img, 4);
            let hexColors = palette.map(
              (rgb) =>
                `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
            );

            if (savedColor && !hexColors.includes(savedColor)) {
              hexColors.push(savedColor);
            }

            setColors(hexColors);
            localStorage.setItem("secondaryPalette", JSON.stringify(hexColors));
          } catch (err) {
            console.error("Color extraction failed:", err);
          }
        };

        imgRef.current = img;
      } catch (e) {
        console.error("Logo hydrate failed:", e);
      }
    };

    fetchLogoAndExtractColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [croppedLogo]);


  const hexToRgbObject = (hex) => {
    const bigint = parseInt(hex.slice(1), 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
      a: 1,
    };
  };

  const getFlow = () => {
    // 1) explicit from state/localStorage
    const raw =
      (location.state?.cardType ||
        localStorage.getItem("card_type") ||
        localStorage.getItem("flow_type") ||
        ""
      ).toLowerCase();
    if (raw === "team") return "Team";
    if (raw === "myself") return "Myself";

    // 2) infer from ids if flag missing
    const hasTeam =
      !!teamId || !!localStorage.getItem("team_card_id");
    const hasPersonal =
      !!cardId || !!localStorage.getItem("personal_card_id");
    return hasTeam && !hasPersonal ? "Team" : "Myself";
  };


  const handleBack = () => {
    const flow = getFlow();
    navigate("/create/primary-color", {
      state: {
        cardType: flow,
        cardId: effectiveCardId,
        teamId: effectiveTeamId,
        croppedLogo,
        primaryColor,     // keep primary color selected earlier
      },
    });
  };

  const handleNext = async () => {
    try {
      const flow = getFlow();
      if (flow === "Myself" && !effectiveCardId) {
        alert("Missing card ID. Please go back to Step 1.");
        return;
      }
      if (flow === "Team" && !effectiveTeamId) {
        alert("Missing team ID. Please go back to Step 1.");
        return;
      }

      // decide next route based on card type
      // const nextRoute =
      // cardType === "Team" ? "/create/upload-info" : "/create/template-selection";
      const nextRoute = flow === "Team" ? "/create/upload-info" : "/create/template-selection";

      const token = localStorage.getItem("token");
      const secondaryColor =
        selectedColor ||
        `#${(
          (1 << 24) +
          (customColor.r << 16) +
          (customColor.g << 8) +
          customColor.b
        )
          .toString(16)
          .slice(1)}`;

      const payload = {
        secondaryColor,
        cardType: flow,
        cardId: flow === "Myself" ? effectiveCardId : undefined,
        teamId: flow === "Team" ? effectiveTeamId : undefined,
      };

      const res = await fetch(`${API_URL}/api/save-color`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Save failed (${res.status})`);
      }

      // Go to Step 5 (Template Selection)
      navigate(nextRoute, {
        state: {
          cardType: flow,
          cardId: effectiveCardId,
          teamId: effectiveTeamId,
          croppedLogo,
          primaryColor,
          secondaryColor,
        },
      });
    } catch (err) {
      console.error("Failed to save secondary color:", err);
      // Still go forward so the user isn’t blocked
      const flow = getFlow();
      const nextRoute = flow === "Team" ? "/create/upload-info" : "/create/template-selection";
      navigate(nextRoute, {
        state: {
          cardType: flow,
          cardId: effectiveCardId,
          teamId: effectiveTeamId,
          croppedLogo,
          primaryColor,
          secondaryColor:
            selectedColor ||
            `#${(
              (1 << 24) +
              (customColor.r << 16) +
              (customColor.g << 8) +
              customColor.b
            )
              .toString(16)
              .slice(1)}`,
        },
      });
    }
  };

  const goBack = () => {
    const flow = getFlowType(); // your existing helper there
    const state = {
      cardType: flow === "team" ? "Team" : "Myself",
      teamId: Number(localStorage.getItem("team_card_id")) || undefined,
      cardId: Number(localStorage.getItem("personal_card_id")) || undefined,
      primaryColor: cardInfo?.primary_color,
      secondaryColor: cardInfo?.secondary_color,
      croppedLogo: cardInfo?.logo,
    };
    if (flow === "team") {
      navigate("/create/upload-info", { state });
    } else {
      navigate("/create/background-color", { state });
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[360px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 4</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-2">Background Color</h3>
        <p className="text-sm text-gray-600 mb-4">
          Select your background color for Your Virtual Business Card.
          Choose from the available colors or click the plus icon to add a new one.
        </p>

        <div className="flex justify-center items-center gap-3 mb-4">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border shadow-md cursor-pointer ${color.toLowerCase() === selectedColor?.toLowerCase()
                  ? "ring-2 ring-blue-500"
                  : ""
                }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                const rgb = hexToRgbObject(color);
                setCustomColor(rgb);
                setSelectedColor(color);

                persistedSecondaryColor = color;
                persistedSecondaryCustomColor = rgb;
                localStorage.setItem("secondaryColor", color);
                localStorage.setItem("customSecondaryColor", JSON.stringify(rgb));
              }}
              title={`Pick ${color}`}
            />
          ))}

          <div onClick={() => setShowPicker(!showPicker)}
            className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center cursor-pointer">
            <span className="text-[14px] font-bold leading-[0] relative -top-[1px]">+</span>
          </div>

        </div>

        {showPicker && (
          <div className="absolute top-[250px] left-1/2 transform -translate-x-1/2 z-50">
            <SketchPicker
              color={customColor}
              onChange={(color) => setCustomColor(color.rgb)}
              onChangeComplete={() => { }}
              presetColors={colors.concat([
                `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a})`,
              ])} // optional: remove preset swatches
            />
            <div className="mt-2 flex justify-center items-center gap-2">
              <div
                className="w-6 h-6 rounded-full border shadow-md cursor-pointer"
                style={{
                  backgroundColor: `rgb(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a})`,
                }}
                onClick={() => {
                  const hex = `#${(
                    (1 << 24) +
                    (customColor.r << 16) +
                    (customColor.g << 8) +
                    customColor.b
                  )
                    .toString(16)
                    .slice(1)}`;
                  setColors((prev) => [...prev, hex]);
                  setShowPicker(false);

                  // 🟡 Persist the new custom color as selected
                  setSelectedColor(hex);
                  persistedPrimaryColor = hex;
                  persistedPrimaryCustomColor = customColor;
                  localStorage.setItem("primaryColor", hex);
                  localStorage.setItem("customPrimaryColor", JSON.stringify(customColor));
                }}


                title="Add this color"
              />

            </div>

          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={handleBack}
            className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedColor && !customColor}
            className={`bg-blue-400 text-white px-4 py-2 rounded-md text-sm ${!selectedColor && !customColor ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-500"
              }`}
          >
            Next →
          </button>
        </div>

        <img ref={imgRef} crossOrigin="anonymous" className="hidden" />
      </div>
    </div>
  );
}
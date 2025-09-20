import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ColorThief from "colorthief";
import { SketchPicker } from "react-color";

let persistedPrimaryColor = null;
let persistedPrimaryCustomColor = { r: 0, g: 0, b: 0, a: 1 };

const PrimaryColorModal = ({ onClose, onBack, onNext }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cardId, cardType, teamId, croppedLogo } = location.state || {};

  const [colors, setColors] = useState([]);
  const imgRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(persistedPrimaryCustomColor);
  const [selectedColor, setSelectedColor] = useState(persistedPrimaryColor);

  // after hooks
const getEffectiveCardId = () => {
  if (cardId) return cardId;
  const stored = localStorage.getItem("personal_card_id");
  return stored && stored !== "null" && stored !== "undefined" ? Number(stored) : null;
};
const getEffectiveTeamId = () => {
  if (teamId) return teamId;
  const stored = localStorage.getItem("team_id");
  return stored && stored !== "null" && stored !== "undefined" ? Number(stored) : null;
};
const effectiveCardId = getEffectiveCardId();
const effectiveTeamId = getEffectiveTeamId();


  useEffect(() => {
  // 1) Restore palette & selection quickly
  const savedPalette = localStorage.getItem("primaryPalette");
  if (savedPalette) setColors(JSON.parse(savedPalette));

  const savedColor = localStorage.getItem("primaryColor");
  const savedCustom = localStorage.getItem("customPrimaryColor");
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

      // 2) Prefer location.state if it's already a DATA URL
      if (typeof croppedLogo === "string" && croppedLogo.startsWith("data:")) {
        dataUrl = croppedLogo;
      }

      // 3) If location.state is a BLOB URL, try to convert it (works before refresh, but not after)
      if (!dataUrl && typeof croppedLogo === "string" && croppedLogo.startsWith("blob:")) {
        try {
          const res = await fetch(croppedLogo);
          const blob = await res.blob();
          dataUrl = await blobToDataURL(blob);
        } catch {
          // blob: is likely dead after refresh; ignore and fall through
        }
      }

      // 4) Local cache from Step 2
      if (!dataUrl) {
        const cached = localStorage.getItem("last_logo_preview"); // data URL only
        if (cached && cached.startsWith("data:")) dataUrl = cached;
      }

      // 5) Backend fallback
      if (!dataUrl) {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/logo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 0) dataUrl = await blobToDataURL(blob);
        }
      }

      if (!dataUrl) {
        console.warn("No logo available for color extraction.");
        return;
      }

      // Persist for Step 2 (back) and future refreshes
      localStorage.setItem("last_logo_preview", dataUrl);

      // Build <img> for ColorThief
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = dataUrl;

      img.onload = () => {
        const colorThief = new ColorThief();
        try {
          const palette = colorThief.getPalette(img, 4);
          let hexColors = palette.map(
            (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
          );

          const saved = localStorage.getItem("primaryColor");
          if (saved && !hexColors.includes(saved)) hexColors.push(saved);

          setColors(hexColors);
          localStorage.setItem("primaryPalette", JSON.stringify(hexColors));
        } catch (err) {
          console.error("Color extraction failed:", err);
        }
      };

      imgRef.current = img;
    } catch (err) {
      console.error("Failed to hydrate logo for color extraction:", err);
    }
  };

  fetchLogoAndExtractColors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [croppedLogo]);


  const handleColorChange = (color) => {
    setColors((prev) => [...prev, color.hex]); 
    setShowPicker(false);
  };

  const hexToRgbObject = (hex) => {
  const bigint = parseInt(hex.slice(1), 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
    a: 1,
  };
};

const handleNext = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
         alert("You’re not logged in. Please log in again.");
         return;
       }

    // Create a payload to send to the server
    // guard IDs (router state may be empty after refresh)
   if (cardType === "Myself" && !effectiveCardId) {
     alert("Missing card ID. Please go back to Step 1.");
     return;
   }
   if (cardType === "Team" && !effectiveTeamId) {
     alert("Missing team ID. Please go back to Step 1.");
     return;
   }

   const payload = {
     primaryColor: selectedColor,
     cardType,
     cardId: cardType === "Myself" ? effectiveCardId : undefined,
     teamId: cardType === "Team" ? effectiveTeamId : undefined,
   };

   const res = await fetch("http://localhost:5000/api/save-color", {
       method: "POST",
       headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
       body: JSON.stringify(payload),
     });
     if (!res.ok) {
       const errBody = await res.json().catch(() => ({}));
       throw new Error(errBody.error || `Save failed (${res.status})`);
     }

    // Navigate to the next step, passing all relevant data
    navigate("/create/background-color", {
      state: {
        cardType,
        cardId: effectiveCardId,
        teamId: effectiveTeamId,
        croppedLogo,
        primaryColor: selectedColor
      }
    });
  } catch (err) {
    console.error("Failed to save color:", err);
    // It's a good practice to still navigate even on error for now
    // to not block the user, as the error might be temporary
    navigate("/create/background-color", {
      state: {
        cardType,
        cardId: effectiveCardId,
        teamId: effectiveTeamId,
        croppedLogo,
        primaryColor: selectedColor
      }
    });
  }
};

const handleBack = () => {
  const cachedDataUrl = localStorage.getItem("last_logo_preview") || null;

  // Navigate back to the previous step (CompanyLogoModal)
  navigate("/create/company-logo", {
    state: {
      cardType,
      cardId: effectiveCardId,
      teamId: effectiveTeamId,
      // prefer persistent data URL so Step 2 has a valid image after refresh
      croppedLogo: cachedDataUrl,
    }
  });
};

// This handler adds the custom color to the palette and selects it
const handleAddCustomColor = (color) => {
  const hex = color.hex;
  setCustomColor(color.rgb);
  setSelectedColor(hex);
  if (!colors.includes(hex)) {
      setColors((prev) => [...prev, hex]);
  }
  setShowPicker(false);
  // Persist to local storage
  localStorage.setItem("primaryColor", hex);
  localStorage.setItem("customPrimaryColor", JSON.stringify(color.rgb));
};


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[340px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 3</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-1">
          Primary Text Color
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Select your primary text color to match your logo. Choose from the
          available colors or click the plus icon to add a new one.
        </p>

        <div className="flex justify-center items-center gap-3 mb-4">
          {colors.map((color, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border shadow-md cursor-pointer ${
                color.toLowerCase() ===
                `#${((1 << 24) + (customColor.r << 16) + (customColor.g << 8) + customColor.b)
                  .toString(16)
                  .slice(1)}`.toLowerCase()
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                const rgb = hexToRgbObject(color);
                setCustomColor(rgb);
                setSelectedColor(color);

                // persist for future re-renders
                persistedPrimaryColor = color;
                persistedPrimaryCustomColor = rgb;
                localStorage.setItem("primaryColor", color);
                localStorage.setItem("customPrimaryColor", JSON.stringify(rgb));
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
              onChangeComplete={() => {}}
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
            disabled={!selectedColor}
            className={`bg-blue-400 text-white px-4 py-2 rounded-md text-sm ${
              selectedColor ? "hover:bg-blue-500" : "opacity-50 cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>

        {/* Hidden image used for color extraction */}
        <img ref={imgRef} crossOrigin="anonymous" className="hidden" />

      </div>
    </div>
  );
};

export default PrimaryColorModal;
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";

const CompanyLogoModal = ({croppedLogo, setCroppedLogo}) => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
  const navigate = useNavigate();
  const location = useLocation();
  const { cardType, cardId, teamId } = location.state || {};
  const editMode = location.state?.editMode === true;

  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);

  // optional cleanup of the old global key so it never leaks into new cards
  try { localStorage.removeItem("last_logo_preview"); } catch {}


  // Get effective IDs with better fallback logic
  const getEffectiveCardId = () => {
    if (cardId) return cardId;
    const stored = localStorage.getItem("personal_card_id");
    return stored && stored !== 'null' && stored !== 'undefined' ? Number(stored) : null;
  };

  const getEffectiveTeamId = () => {
    if (teamId) return teamId;
    const stored = localStorage.getItem("team_id");
    return stored && stored !== 'null' && stored !== 'undefined' ? Number(stored) : null;
  };

  const effectiveCardId = getEffectiveCardId();
  const effectiveTeamId = getEffectiveTeamId();

  // --- durable card type: state -> localStorage -> infer from IDs ---
  const getEffectiveCardType = () => {
    const fromState = location.state?.cardType;
    if (fromState === "Myself" || fromState === "Team") return fromState;
    const stored = localStorage.getItem("card_type");
    if (stored === "Myself" || stored === "Team") return stored;
    if (effectiveTeamId) return "Team";
    if (effectiveCardId) return "Myself";
    return null;
  };
  const effectiveCardType = getEffectiveCardType();
  
  // persist so it survives back/forward without state
  useEffect(() => {
    if (effectiveCardType) {
      localStorage.setItem("card_type", effectiveCardType);
    }
  }, [effectiveCardType]);


    // build a per-card cache key, or null if we don't have an ID yet
  const cacheKey =
  effectiveCardType === "Myself" && effectiveCardId
    ? `logo_preview:Myself:${effectiveCardId}`
    : effectiveCardType === "Team" && effectiveTeamId
    ? `logo_preview:Team:${effectiveTeamId}`
    : null;


  // Debug logging
  useEffect(() => {
    console.log('CompanyLogoModal mounted with:', {
      cardType,
      cardId,
      teamId,
      effectiveCardId,
      effectiveTeamId,
      locationState: location.state
    });
  }, []);

  // put this at the top of the file (you already did)
const isDataUrl = (s) => typeof s === "string" && s.startsWith("data:");

useEffect(() => {
  let cancelled = false;

  const setPreview = (src) => {
    if (cancelled) return;
    setCroppedImage(src);
    setCroppedLogo?.(src);
    try {
      if (typeof src === "string" && src && src !== "null" && src !== "undefined") {
        if (cacheKey && isDataUrl(src)) {
          localStorage.setItem(cacheKey, src);
        }        
      }
    } catch (e) {
      console.warn("Failed to save logo preview to localStorage:", e);
    }
  };

  const hydrate = async () => {
    // 1) From navigation state (only accept data URLs)
    const fromState = location.state?.croppedLogo;
    if (isDataUrl(fromState)) {
      console.log("Using data URL from navigation state");
      setPreview(fromState);
      return;
    }

        // 2) From local cache (scoped to this card/team)
    if (cacheKey) {
      const cachedPreview = localStorage.getItem(cacheKey);
      if (isDataUrl(cachedPreview)) {
        console.log("Using cached logo preview for", cacheKey);
        setPreview(cachedPreview);
        return;
      }
    }
    // If we don't have a cacheKey yet (new card with no id), do NOT read any cache


    // 3) From props
    if (croppedLogo) {
      console.log("Using logo from props");
      setPreview(croppedLogo);
      return;
    }

    // 4) From server (only for 'Myself' in edit mode)
    if (editMode && effectiveCardType === "Myself" && effectiveCardId) {
      console.log("Attempting to fetch logo from server for card ID:", effectiveCardId);
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No auth token found");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/api/get-logo/${effectiveCardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const blob = await res.blob();
          if (blob && blob.size > 0) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result); // data URL
            reader.readAsDataURL(blob);
            return;
          } else {
            console.log("Server returned empty blob for logo");
          }
        } else if (res.status === 404) {
          // Optional fallback: read from personal-card endpoint
          const cardRes = await fetch(`${API_URL}/api/personal-card/${effectiveCardId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (cardRes.ok) {
            const cardData = await cardRes.json();
            if (cardData?.data?.logo) {
              console.log("Found logo in personal card data");
              setPreview(cardData.data.logo);
              return;
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch saved logo:", e);
      } finally {
        setLoading(false);
      }
    }

    console.log("No logo found from any source");
  };

  hydrate();
  return () => { cancelled = true; };
}, [cardType, effectiveCardId, croppedLogo, setCroppedLogo, location.state, editMode]);


  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(cropped);
      setCroppedLogo?.(cropped);
      setImageSrc(null); // close cropper
      
      // Save to localStorage for persistence (only data URLs)
      if (cropped.startsWith('data:') && cacheKey ) {
        try {
          llocalStorage.setItem(cacheKey, cropped);
        } catch (e) {
          console.warn('Failed to save cropped image to localStorage:', e);
        }
      }
    } catch (e) {
      console.error('Failed to crop image:', e);
      alert('Failed to crop image. Please try again.');
    }
  }, [imageSrc, croppedAreaPixels, setCroppedLogo]);

  const uploadImageToServer = async () => {
    if (!croppedImage) {
      console.log('No cropped image to upload');
      return false;
    }

    try {
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Authentication required. Please log in again.");
        return false;
      }

      const formData = new FormData();
      formData.append("logo", blob);
      const type = effectiveCardType;
        if (!type) {
          alert("Missing card type. Please re-open Step 1.");
          return false;
        }
        formData.append("cardType", type);
      if (type === "Myself") {
        if (!effectiveCardId) {
          alert("Missing card ID. Please complete Step 1 first.");
          return false;
        }
        formData.append("cardId", String(effectiveCardId));
      } else if (type === "Team") {
        if (!effectiveTeamId) {
          alert("Missing team ID.");
          return false;
        }
        formData.append("teamId", String(effectiveTeamId));
      }

      console.log("Uploading logo with data:", { 
        cardType: effectiveCardType,
        effectiveCardId, 
        effectiveTeamId,
        hasBlob: !!blob,
        blobSize: blob.size 
      });

      const uploadRes = await fetch(`${API_URL}/api/upload-logo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await uploadRes.json();
      
      if (uploadRes.ok) {
        console.log("Logo uploaded successfully:", result);
        return true;
      } else {
        console.error("Upload failed:", result);
        alert(result.error || "Failed to upload logo");
        return false;
      }
    } catch (e) {
      console.error("Upload failed with error:", e);
      alert("Network error occurred while uploading logo");
      return false;
    }
  };

  const handleBack = () => {
    if (cardType === "Myself") {
      // Ensure the card ID is preserved in localStorage
      if (effectiveCardId) {
        localStorage.setItem("personal_card_id", String(effectiveCardId));
      }
      
      navigate("/create/personal-info", {
        state: { 
          editMode: true, 
          cardData: { cardId: effectiveCardId },
          cardId: effectiveCardId 
        },
      });
    } else if (cardType === "Team") {
      navigate("/create/team-info", { 
        state: { 
          editMode: true, 
          teamData: { teamId: effectiveTeamId },
          teamId: effectiveTeamId 
        } 
      });
    } else {
      navigate("/create/card-type");
    }
  };

  const handleNext = async () => {
    // If no image is selected, allow skipping
    if (!croppedImage) {
      navigate("/create/primary-color", {
        state: {
          cardType: effectiveCardType,
          cardId: effectiveCardId,
          teamId: effectiveTeamId,
        }
      });
      return;
    }

    // Upload the image first
    const success = await uploadImageToServer();
    if (success) {
      navigate("/create/primary-color", {
        state: {
          cardType,
          cardId: effectiveCardId,
          teamId: effectiveTeamId,
          croppedLogo: croppedImage,
        }
      });
    } else {
      // Upload failed, but let user proceed anyway with local image
      const proceed = confirm("Failed to upload logo to server. Do you want to continue anyway?");
      if (proceed) {
        navigate("/create/primary-color", {
          state: {
            cardType,
            cardId: effectiveCardId,
            teamId: effectiveTeamId,
            croppedLogo: croppedImage,
          }
        });
      }
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[340px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 2</h2>
    <h3 className="text-lg font-bold text-[#0b2447] mb-1">Organization or Company Logo</h3>
    <p className="text-xs text-gray-500 mb-2">Upload Logo Here</p>

    <input
      type="file"
      accept="image/*"
      ref={fileInputRef}
      className="hidden"
      onChange={handleImageUpload}
    />
    <div
      onClick={() => fileInputRef.current.click()}
      className="w-24 h-24 border border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4 overflow-hidden cursor-pointer"
    >
      {croppedImage ? (
  <img src={croppedImage} alt="Logo" className="object-contain w-full h-full" />
) : (
  <div className="text-3xl text-gray-400 font-bold">+</div>
)}
    </div>

    {imageSrc && (
      <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex justify-center items-center">
        <div className="relative w-[300px] h-[300px] bg-white">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          <button
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={showCroppedImage}
          >
            Done
          </button>
        </div>
      </div>
    )}

    <div className="flex justify-between mt-4">
      <button
        onClick={handleBack}
        className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700"
      >
        ← Previous
      </button>
      <button
    onClick={handleNext}
    disabled={!croppedImage}
    className={`px-4 py-2 text-sm rounded-md text-white ${
      croppedImage
        ? "bg-blue-400 hover:bg-blue-500 cursor-pointer"
        : "bg-gray-300 cursor-not-allowed"
    }`}
>
    Next →
</button>
    </div>
      </div>
    </div>
  );
};

export default CompanyLogoModal;
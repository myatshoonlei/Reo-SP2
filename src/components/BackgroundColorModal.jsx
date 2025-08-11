import { useEffect, useState, useRef } from "react";
import ColorThief from "colorthief";
import { SketchPicker } from "react-color";

let persistedSecondaryColor = null;
let persistedSecondaryCustomColor = { r: 0, g: 0, b: 0, a: 1 };

const BackgroundColorModal = ({
  onBack,
  cardType,
  setShowBackgroundColorModal,
  setShowUploadModal,
  setShowTemplateSelectionModal,
  cardId,
}) => {
  const [colors, setColors] = useState([]);
  const imgRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(persistedSecondaryCustomColor);
  const [selectedColor, setSelectedColor] = useState(persistedSecondaryColor);

  useEffect(() => {
    const savedColor = localStorage.getItem("secondaryColor");
    const savedCustom = localStorage.getItem("customSecondaryColor");

    if (savedColor) setSelectedColor(savedColor);
    if (savedCustom) setCustomColor(JSON.parse(savedCustom));

    const fetchLogoAndExtractColors = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/logo", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = imageUrl;

      img.onload = () => {
        const colorThief = new ColorThief();
        try {
          const palette = colorThief.getPalette(img, 4);
          let hexColors = palette.map(
            (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
          );

          if (savedColor && !hexColors.includes(savedColor)) {
            hexColors.push(savedColor);
          }

          setColors(hexColors);
        } catch (err) {
          console.error("Color extraction failed:", err);
        }
      };

      imgRef.current = img;
    };

    fetchLogoAndExtractColors();
  }, []);

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
    if (!cardId) {
        alert("Error: Card ID is missing. Cannot save color.");
        return;
      }

    const token = localStorage.getItem("token");
    const secondaryColor =
      selectedColor ||
      `#${((1 << 24) + (customColor.r << 16) + (customColor.g << 8) + customColor.b)
        .toString(16)
        .slice(1)}`;

    await fetch("http://localhost:5000/api/save-color", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ secondaryColor, cardId }),
    });

    // ✅ Show TemplateSelectionModal instead of navigating
    setShowBackgroundColorModal(false);
    setShowUploadModal(false); // optional
    setShowTemplateSelectionModal(true); // 👈 YOU NEED TO CALL THIS
  } catch (err) {
    console.error("Failed to save secondary color:", err);
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
              className={`w-6 h-6 rounded-full border shadow-md cursor-pointer ${
                color.toLowerCase() === selectedColor?.toLowerCase()
                  ? "ring-2 ring-blue-500"
                  : ""
              }`}
              style={{ backgroundColor: color }}
              onClick={() => {
                const rgb = hexToRgbObject(color);
                setCustomColor(rgb);
                setSelectedColor(color);

                // persist
                persistedSecondaryColor = color;
                persistedSecondaryCustomColor = rgb;
                localStorage.setItem("secondaryColor", color);
                localStorage.setItem("customSecondaryColor", JSON.stringify(rgb));
              }}
              title={`Pick ${color}`}
            />
          ))}

          <div
            onClick={() => setShowPicker(!showPicker)}
            className="w-6 h-6 rounded-full border-2 border-blue-300 flex items-center justify-center cursor-pointer"
          >
            <span className="text-[14px] font-bold leading-[0] relative -top-[1px]">+</span>
          </div>
        </div>

        {showPicker && (
          <div className="absolute top-[250px] left-1/2 transform -translate-x-1/2 z-50">
            <SketchPicker
              color={customColor}
              onChange={(color) => setCustomColor(color.rgb)}
              presetColors={colors.concat([
                `rgba(${customColor.r}, ${customColor.g}, ${customColor.b}, ${customColor.a})`,
              ])}
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

                  setSelectedColor(hex);
                  persistedSecondaryColor = hex;
                  persistedSecondaryCustomColor = customColor;
                  localStorage.setItem("secondaryColor", hex);
                  localStorage.setItem("customSecondaryColor", JSON.stringify(customColor));
                }}
                title="Add this color"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={onBack}
            className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedColor && !customColor}
            className="bg-blue-400 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500"
          >
            Next →
          </button>
        </div>

        <img ref={imgRef} crossOrigin="anonymous" className="hidden" />
      </div>
    </div>
  );
};

export default BackgroundColorModal;
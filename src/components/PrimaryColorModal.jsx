import { useEffect, useState, useRef } from "react";
import ColorThief from "colorthief";
import { SketchPicker } from "react-color";


let persistedPrimaryColor = null;
let persistedPrimaryCustomColor = { r: 0, g: 0, b: 0, a: 1 };

const PrimaryColorModal = ({ onClose, onBack, onNext, cardId }) => {
  const [colors, setColors] = useState([]);
  const imgRef = useRef(null);
  const [showPicker, setShowPicker] = useState(false);
  const [customColor, setCustomColor] = useState(persistedPrimaryCustomColor);
  const [selectedColor, setSelectedColor] = useState(persistedPrimaryColor);

  useEffect(() => {
  const savedColor = localStorage.getItem("primaryColor");
  const savedCustom = localStorage.getItem("customPrimaryColor");

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
          (rgb) =>
            `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
        );

        // 🟡 Add custom color to palette if it was saved before
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
  if (!cardId) { // 🆕 Add a check
      console.error("Card ID is missing. Cannot save color.");
      // Optionally, you could just proceed without saving if a cardId isn't found,
      // but it's better to show an error and not proceed.
      onNext(); 
      return;
    }

  try {
    const token = localStorage.getItem("token");

    const primaryColor = selectedColor || `#${(
      (1 << 24) +
      (customColor.r << 16) +
      (customColor.g << 8) +
      customColor.b
    )
      .toString(16)
      .slice(1)}`;

    await fetch("http://localhost:5000/api/save-color", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ primaryColor, cardId }),
    });

    onNext();
    

  } catch (err) {
    console.error("Failed to save color:", err);
  }
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
            onClick={onBack}
            className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
          >
            ← Previous
          </button>
          <button
            onClick={handleNext}

            className="bg-blue-400 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500"
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
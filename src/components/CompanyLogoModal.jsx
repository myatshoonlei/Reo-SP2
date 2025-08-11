import Cropper from "react-easy-crop";
import { useRef, useState, useCallback } from "react";
import getCroppedImg from "../utils/cropImage"; // utility to crop

const CompanyLogoModal = ({ onClose, onBack, onNext, croppedLogo, setCroppedLogo, cardType }) => {
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const croppedImage = croppedLogo;
const setCroppedImage = setCroppedLogo;


  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

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
      setImageSrc(null); // close cropper
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const uploadImageToServer = async () => {
    if (!croppedImage) return false;

    const res = await fetch(croppedImage);
    const blob = await res.blob();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("logo", blob);

    try {
      const uploadRes = await fetch("http://localhost:5000/api/upload-logo/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      localStorage.removeItem("primaryColor");
      localStorage.removeItem("customPrimaryColor");
      localStorage.removeItem("secondaryColor");
      localStorage.removeItem("customSecondaryColor");

      const result = await uploadRes.json();
      console.log("Uploaded successfully:", result);
      return true;
    } catch (error) {
      console.error("Upload failed:", error);
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[340px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 2</h2>
    <h3 className="text-lg font-bold text-[#0b2447] mb-1">Company Logo</h3>
    <p className="text-xs text-gray-500 mb-2">Upload Your Company Logo</p>

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
  <div className="text-3xl text-navy-300 font-bold">+</div>
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
        onClick={onBack}
        className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700"
      >
        ← Previous
      </button>
      <button
        onClick={async () => {
          const success = await uploadImageToServer();
          if (success) {
            // alert("Logo uploaded!");
            onNext(); // or onNext() if you continue to another step
          } else {
            alert("Failed to upload logo. Try again.");
          }
        }}
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
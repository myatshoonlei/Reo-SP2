import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const QRCodeGenerator = () => {
  const [url, setUrl] = useState("");
  const [showQR, setShowQR] = useState(false);

  const handleGenerate = () => {
    if (url.trim() !== "") {
      setShowQR(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center text-white">
      <h1 className="text-3xl font-bold mb-6">QR Code Generator</h1>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="e.g. https://google.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="px-4 py-2 rounded-md text-white w-72 bg-slate-800 border border-gray-500"
        />
        <button
          className="text-green-500 font-semibold hover:underline"
          onClick={handleGenerate}
        >
          Generate
        </button>
      </div>

      {showQR && (
        <QRCodeCanvas
          value={url}
          size={200}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      )}
    </div>
  );
};

export default QRCodeGenerator;
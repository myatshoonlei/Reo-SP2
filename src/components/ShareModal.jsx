import { X, Share, ImageDown, QrCode } from 'lucide-react';
import { toPng } from 'html-to-image';
import ReactDOM from 'react-dom/client';

export default function ShareModal({ card, onClose, cardRef, TemplateComponent }) {
  if (!card) return null;

  const handleShareLink = async () => {

    
    const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const url = `${BASE}/card/${card.id}`;
    const shareData = {
      title: `My Business Card: ${card.fullname}`,
      text: `Check out my digital business card!`,
      url: url,
    };
    if (navigator.share) {
      await navigator.share(shareData).catch(err => console.error("Share failed:", err));
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadImage = async () => {

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (!TemplateComponent) {
      return alert("Template component is missing.");
    }

    // 1. Create a hidden container off-screen
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Create a temporary div for React to render into
    const renderTarget = document.createElement('div');
    container.appendChild(renderTarget);
    
    // 2. Render both sides of the card into the hidden container
    const root = ReactDOM.createRoot(renderTarget);
    root.render(
      <>
        <div id="card-front-capture" style={{ width: '350px', height: '200px' }}>
          <TemplateComponent {...card} side="front" />
        </div>
        <div id="card-back-capture" style={{ width: '350px', height: '200px' }}>
          <TemplateComponent {...card} side="back" />
        </div>
      </>
    );

    try {
      // Give React a moment to render
      await new Promise(resolve => setTimeout(resolve, 200));

      const frontEl = document.getElementById('card-front-capture');
      const backEl = document.getElementById('card-back-capture');

      // Font fetching logic (same as before to prevent CORS errors)
      const fontUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&display=swap';
      const response = await fetch(`${API_URL}/api/proxy/font-css?url=${encodeURIComponent(fontUrl)}`);
      const fontCss = await response.text();
      const options = { cacheBust: true, pixelRatio: 2, fontEmbedCSS: fontCss };

      // 3. Take a "picture" of each side
      const frontDataUrl = await toPng(frontEl, options);
      const backDataUrl = await toPng(backEl, options);

      // 4. Combine the two pictures on a new canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cardWidth = 350 * 2; // High resolution
      const cardHeight = 200 * 2;
      const padding = 20;

      canvas.width = cardWidth;
      canvas.height = (cardHeight * 2) + padding;
      ctx.fillStyle = 'white'; // Fill background white
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const frontImage = new Image();
      await new Promise(resolve => { frontImage.onload = resolve; frontImage.src = frontDataUrl; });
      ctx.drawImage(frontImage, 0, 0, cardWidth, cardHeight);

      const backImage = new Image();
      await new Promise(resolve => { backImage.onload = resolve; backImage.src = backDataUrl; });
      ctx.drawImage(backImage, 0, cardHeight + padding, cardWidth, cardHeight);

      // 5. Trigger the download of the final combined image
      const finalDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${card.fullname}-card-both-sides.png`;
      link.href = finalDataUrl;
      link.click();

    } catch (err) {
      console.error('Failed to download image', err);
      alert("Sorry, there was an error downloading the card image.");
    } finally {
      // 6. Clean up by removing the hidden container
      document.body.removeChild(container);
    }
  };

  const handleDownloadQr = () => {
    if (!card.qr) {
      return alert("QR code not available for this card.");
    }
    const link = document.createElement('a');
    link.href = card.qr;
    link.download = `${card.fullname}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center font-sans" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" aria-label="Close modal">
          <X size={24} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Share your card</h3>
        <div className="flex justify-around items-start">
          {/* --- MODIFIED BUTTONS WITH COLORS --- */}
          <ActionButton Icon={Share} label="Share To" onClick={handleShareLink} colors="bg-blue-100 text-blue-600 hover:bg-blue-200" />
          <ActionButton Icon={ImageDown} label="Download Card" onClick={handleDownloadImage} colors="bg-green-100 text-green-600 hover:bg-green-200" />
          <ActionButton Icon={QrCode} label="Download QR" onClick={handleDownloadQr} colors="bg-purple-100 text-purple-600 hover:bg-purple-200" />
        </div>
      </div>
    </div>
  );
}

// Updated ActionButton to accept a 'colors' prop
const ActionButton = ({ Icon, label, onClick, colors }) => (
  <div className="flex flex-col items-center space-y-2 w-24 text-center">
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${colors}`}
    >
      <Icon size={28} />
    </button>
    <span className="text-sm text-gray-600 leading-tight">{label}</span>
  </div>
);
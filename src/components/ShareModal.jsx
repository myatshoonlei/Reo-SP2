import { X, Share, ImageDown, QrCode } from 'lucide-react';
import { toPng } from 'html-to-image';
import ReactDOM from 'react-dom/client';
import QRCode from 'qrcode';

export default function ShareModal({ card, onClose, cardRef, TemplateComponent, shareUrl }) {
  if (!card) return null;

  // personal vs team link (auto)
  const buildShareUrl = () => {
    if (shareUrl) return shareUrl;
    if (card.shareUrl) return card.shareUrl;

    const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

    const teamId = card.team_id ?? card.teamid; // support both shapes
    if (teamId && card.id) return `${BASE}/team/${teamId}/member/${card.id}`;
    if (card.id) return `${BASE}/card/${card.id}`;
    return window.location.href;
  };

  const handleShareLink = async () => {




    const url = buildShareUrl();

    const shareData = {
      title: `My Business Card: ${card.fullname || 'Card'}`,
      text: `Check out my digital business card!`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const safeFile = (s) => String(s || 'card')
    .replace(/[^\w\s.-]+/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 80);

  const handleDownloadImage = async () => {

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (!TemplateComponent) {
      alert("Template component is missing.");
      return;
    }

    // hidden container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const renderTarget = document.createElement('div');
    container.appendChild(renderTarget);
    const root = ReactDOM.createRoot(renderTarget);

    // unique ids to avoid collisions
    const frontId = `card-front-${card.id || 'x'}`;
    const backId = `card-back-${card.id || 'x'}`;

    root.render(
      <>
        <div id={frontId} style={{ width: '350px', height: '200px' }}>
          <TemplateComponent {...card} side="front" />
        </div>
        <div id={backId} style={{ width: '350px', height: '200px' }}>
          <TemplateComponent {...card} side="back" />
        </div>
      </>
    );

    try {
      await new Promise(r => setTimeout(r, 200));

      // query INSIDE the renderTarget we just created
      const frontEl = renderTarget.querySelector(`#${CSS.escape(frontId)}`);
      const backEl = renderTarget.querySelector(`#${CSS.escape(backId)}`);
      if (!frontEl || !backEl) throw new Error('Capture elements not found');

      const fontUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&display=swap';

      const response = await fetch(`${API_URL}/api/proxy/font-css?url=${encodeURIComponent(fontUrl)}`);
      const fontCss = await response.text();


      // Graceful fallback if proxy missing


      const options = { cacheBust: true, pixelRatio: 2, fontEmbedCSS: fontCss };

      const [frontDataUrl, backDataUrl] = await Promise.all([
        toPng(frontEl, options),
        toPng(backEl, options),
      ]);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const cardWidth = 350 * 2;
      const cardHeight = 200 * 2;
      const padding = 20;

      canvas.width = cardWidth;
      canvas.height = (cardHeight * 2) + padding;
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const frontImage = new Image();
      const backImage = new Image();

      await new Promise(res => { frontImage.onload = res; frontImage.src = frontDataUrl; });
      ctx.drawImage(frontImage, 0, 0, cardWidth, cardHeight);

      await new Promise(res => { backImage.onload = res; backImage.src = backDataUrl; });
      ctx.drawImage(backImage, 0, cardHeight + padding, cardWidth, cardHeight);

      const finalDataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${safeFile(card.fullname)}-card-both-sides.png`;
      link.href = finalDataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert("Sorry, there was an error downloading the card image.");
    } finally {
      // ✅ clean up
      try { root.unmount(); } catch { }
      document.body.removeChild(container);
    }
  };


  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Image failed to load: ${src}`));
      img.src = src;
    });
  }

  
  const handleDownloadQr = async () => {
  try {
    const url = buildShareUrl(); // dynamic link
    const qrDataUrl = await QRCode.toDataURL(url, { errorCorrectionLevel: 'H' });

    const qrImg = await loadImage(qrDataUrl); // ✅ use generated QR, not card.qr

    // Canvas setup
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const W = 900, H = 1400, PAD = 48, CARD_R = 32;
    canvas.width = W; canvas.height = H;

    // Rounded-rect helper
    const roundRect = (x, y, w, h, r) => {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + rr, y);
      ctx.lineTo(x + w - rr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
      ctx.lineTo(x + w, y + h - rr);
      ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
      ctx.lineTo(x + rr, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
      ctx.lineTo(x, y + rr);
      ctx.quadraticCurveTo(x, y, x + rr, y);
      ctx.closePath();
    };

    // Background and card
    ctx.clearRect(0, 0, W, H);
    const cardX = PAD, cardY = PAD, cardW = W - PAD * 2, cardH = H - PAD * 2;
    ctx.fillStyle = "#ffffff";
    roundRect(cardX, cardY, cardW, cardH, CARD_R);
    ctx.fill();

    // Header
    const headerH = 140;
    ctx.fillStyle = "#cfe0ff";
    roundRect(cardX, cardY, cardW, headerH + CARD_R, CARD_R);
    ctx.fill();

    ctx.fillStyle = "#1f2b5a";
    ctx.font = "bold 48px Poppins, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Reo", W / 2, cardY + headerH / 2 + 18);

    // ✅ Draw dynamic QR image
    const qrSize = 560;
    const qrX = (W - qrSize) / 2;
    const qrY = cardY + (cardH - qrSize) / 2 - 50;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

    // Optional logo overlay
    const innerLogo = await loadImage("/ReoLogo.png");
    const innerLogoSize = Math.round(qrSize * 0.16);
    const cx = W / 2, cy = qrY + qrSize / 2;
    const box = Math.round(innerLogoSize * 1.25);

    ctx.fillStyle = "#ffffff";
    const rr = Math.round(box * 0.2);
    ctx.beginPath();
    ctx.moveTo(cx - box / 2 + rr, cy - box / 2);
    ctx.arcTo(cx + box / 2, cy - box / 2, cx + box / 2, cy - box / 2 + rr, rr);
    ctx.arcTo(cx + box / 2, cy + box / 2, cx + box / 2 - rr, cy + box / 2, rr);
    ctx.arcTo(cx - box / 2, cy + box / 2, cx - box / 2, cy + box / 2 - rr, rr);
    ctx.arcTo(cx - box / 2, cy - box / 2, cx - box / 2 + rr, cy - box / 2, rr);
    ctx.closePath();
    ctx.fill();

    ctx.drawImage(innerLogo, cx - innerLogoSize / 2, cy - innerLogoSize / 2, innerLogoSize, innerLogoSize);

    // Name + company
    const nameY = qrY + qrSize + 110;
    ctx.fillStyle = "#000000";
    ctx.font = "600 44px Poppins, Arial, sans-serif";
    ctx.fillText(card.fullname, W / 2, nameY);

    const company = card.company_name || card.companyName || "";
    ctx.fillStyle = "#344054";
    ctx.font = "500 32px Poppins, Arial, sans-serif";
    ctx.fillText(company ? `@${company}` : "", W / 2, nameY + 54);

    // Download
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${card.fullname}-qrcode.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (err) {
    console.error("handleDownloadQr failed:", err);
    alert(err.message || "Could not generate the QR image.");
  }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center font-sans" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" aria-label="Close modal">
          <X size={24} />
        </button>
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Share your card</h3>
        <div className="flex justify-around items-start">
          <ActionButton Icon={Share} label="Share To" onClick={handleShareLink} colors="bg-blue-100 text-blue-600 hover:bg-blue-200" />
          <ActionButton Icon={ImageDown} label="Download Card" onClick={handleDownloadImage} colors="bg-green-100 text-green-600 hover:bg-green-200" />
          <ActionButton Icon={QrCode} label="Download QR" onClick={handleDownloadQr} colors="bg-purple-100 text-purple-600 hover:bg-purple-200" />
        </div>
      </div>
    </div>
  );
}

const ActionButton = ({ Icon, label, onClick, colors }) => (
  <div className="flex flex-col items-center space-y-2 w-24 text-center">
    <button onClick={onClick} className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${colors}`}>
      <Icon size={28} />
    </button>
    <span className="text-sm text-gray-600 leading-tight">{label}</span>
  </div>
);

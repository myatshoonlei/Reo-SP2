import { X, Share, ImageDown, QrCode } from 'lucide-react';
import { toPng } from 'html-to-image';
import ReactDOM from 'react-dom/client';

export default function ShareModal({ card, onClose, cardRef, TemplateComponent, shareUrl }) {
  if (!card) return null;

  // personal vs team link (auto)
  const buildShareUrl = () => {
    if (shareUrl) return shareUrl;
    if (card.shareUrl) return card.shareUrl;

    const origin = window.location.origin;
    const teamId = card.team_id ?? card.teamid; // support both shapes
    if (teamId && card.id) return `${origin}/team/${teamId}/member/${card.id}`;
    if (card.id) return `${origin}/card/${card.id}`;
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
    const backId  = `card-back-${card.id || 'x'}`;

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
      const backEl  = renderTarget.querySelector(`#${CSS.escape(backId)}`);
      if (!frontEl || !backEl) throw new Error('Capture elements not found');

      const fontUrl = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;700;800&display=swap';

      // Graceful fallback if proxy missing
      let fontCss = "";
      try {
        const resp = await fetch(
          `http://localhost:5000/api/proxy/font-css?url=${encodeURIComponent(fontUrl)}`
        );
        if (resp.ok) fontCss = await resp.text();
      } catch {/* ignore */}

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
      try { root.unmount(); } catch {}
      document.body.removeChild(container);
    }
  };

  const handleDownloadQr = () => {
    if (!card.qr) return alert("QR code not available for this card.");
    const link = document.createElement('a');
    link.href = card.qr;
    link.download = `${safeFile(card.fullname)}-qrcode.png`;
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

import React from 'react';
import { Pencil, Share2, Trash2, CheckCircle } from 'lucide-react';

// Helper function to handle logo source, preventing import errors.
const getLogoSrc = (logo) => logo || 'https://placehold.co/100x100/e2e8f0/e2e8f0?text=Logo';

const CardTile = React.forwardRef(({ card, TemplateComponent, onEdit, onShare, onDelete, isSelectMode, isSelected, onSelect }, ref) => {
  
  const handleShareClick = (e) => {
    e.stopPropagation(); // Prevent card selection when clicking share
    if (onShare) {
      onShare(card);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    onEdit(card);
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(card);
  }

  const handleTileClick = () => {
    if (isSelectMode && onSelect) {
      onSelect(card.id);
    }
  };

  return (
    <div
      className={`relative group transition-all duration-200 rounded-xl ${isSelectMode ? 'cursor-pointer' : ''} ${isSelected ? 'ring-4 ring-blue-500 ring-offset-2' : ''}`}
      ref={ref}
      onClick={handleTileClick}
    >
      <div style={{ fontFamily: card.font_family || card.fontFamily }}>
        <TemplateComponent
          {...card}
          // make sure templates see both snake & camel just in case
          primary_color={card.primary_color || card.primaryColor}
          secondary_color={card.secondary_color || card.secondaryColor}
          font_family={card.font_family || card.fontFamily}
          logo={getLogoSrc(card.logo)}
        />
      </div>

      {/* --- UI for Select Mode --- */}
      {isSelectMode && (
        <>
          <div className={`absolute inset-0 rounded-xl transition-all ${isSelected ? 'bg-blue-900/30' : 'bg-black/20 opacity-0 group-hover:opacity-100'}`}></div>
          <div className="absolute top-4 left-4 z-20">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-white/50 border-white'}`}
            >
              {isSelected && <CheckCircle size={20} className="text-white" />}
            </div>
          </div>
        </>
      )}

      {/* --- Action buttons (hidden in select mode) --- */}
      {!isSelectMode && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleEditClick}
            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label="Edit card"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={handleShareClick}
            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label="Share card"
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-full bg-red-500/60 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors"
            aria-label="Delete card"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )}
    </div>
  );
});

export default CardTile;
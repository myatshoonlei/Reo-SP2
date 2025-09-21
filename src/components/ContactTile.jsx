import React from "react";
import { Link2, Trash2 } from "lucide-react";

const ContactTile = React.forwardRef(
  ({ contact, onCopyLink, onDelete }, ref) => {
    const handleCopyClick = (e) => {
      e.stopPropagation();
      if (onCopyLink) onCopyLink(contact);
    };

    const handleDeleteClick = (e) => {
      e.stopPropagation();
      if (onDelete) onDelete(contact);
    };

    return (
      <div
        className="relative group transition-all duration-200 rounded-xl"
        ref={ref}
      >
        {/* --- Main contact card body --- */}
        <div className="bg-white p-4 rounded-xl border shadow-md flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            {contact.profilePhoto ? (
              <img
                src={`data:image/png;base64,${contact.profilePhoto}`}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {(contact.name || "C").charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="font-bold text-lg text-gray-800 truncate">
              {contact.name}
            </h3>
          </div>

          <div className="text-sm text-gray-600 space-y-1 pl-1 pt-2 border-t">
            <p>{contact.email || "No email"}</p>
            <p>{contact.phone || "No phone"}</p>
            <p>{contact.company || "No company"}</p>
          </div>
        </div>

        {/* --- Action buttons (hover like CardTile) --- */}
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={handleCopyClick}
            className="p-2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors"
            aria-label="Copy link"
          >
            <Link2 size={18} className="text-emerald-400" />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 rounded-full bg-red-500/60 text-white backdrop-blur-sm hover:bg-red-500/80 transition-colors"
            aria-label="Delete contact"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    );
  }
);

export default ContactTile;

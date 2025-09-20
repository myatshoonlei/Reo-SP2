import React from "react";

export default function UploadTile({
  title,
  shape = "square",
  previewUrl,
  onFileChange,
}) {
  const inputId = `${title.replace(/\s+/g, "-").toLowerCase()}-input`;

  return (
    <div className="rounded-2xl border border-[#d6e6fb] bg-white">
      <div className="px-5 pt-4 pb-3">
        <h3 className="font-semibold text-[#0b2447]">{title}</h3>
      </div>
      <div className="px-5 pb-5">
        <div className="relative w-36 h-36">
          {/* Image preview and file input trigger */}
          <label htmlFor={inputId} className="block cursor-pointer">
            <div
              className={[
                "w-full h-full border border-[#e3edfb] bg-[#f6f9ff] overflow-hidden group hover:opacity-80 transition-opacity",
                shape === "circle" ? "rounded-full" : "rounded-xl",
                "ring-1 ring-white shadow-sm",
              ].join(" ")}
            >
              {/* Use undefined to avoid the “empty string src” warning */}
              <img
                src={previewUrl || undefined}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
            {/* The plus icon */}
            <div
              className={[
                "absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center text-white bg-black/60 hover:bg-black transition-colors z-10",
                "translate-x-1/4 translate-y-1/4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300 ease-in-out",
              ].join(" ")}
            >
              +
            </div>
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
        </div>
      </div>
    </div>
  );
}
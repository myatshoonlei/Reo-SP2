import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar() {
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);
  const navigate = useNavigate();

  const openAboutEdit = () => {
    navigate("/edit/about/" + (localStorage.getItem("personal_card_id") || ""));
  };

  return (
    <aside className="ml-6 w-1/5 bg-[#f0f8ff] p-4 flex flex-col items-center rounded-xl shadow-md">
      <ul className="w-full space-y-2">
        <li>
          <button
            onClick={() => setIsMyCardsOpen((v) => !v)}
            className="w-full text-left px-4 py-3 text-md rounded-lg bg-white text-[#0b2447] font-semibold shadow flex items-center justify-between"
          >
            <span>My Cards</span>
            <span className="text-sm">{isMyCardsOpen ? "▾" : "▸"}</span>
          </button>
          {isMyCardsOpen && (
            <div className="mt-2 ml-2 border border-[#c7def3] bg-white rounded-lg shadow-sm">
              <button
                onClick={openAboutEdit}
                className="w-full text-left px-4 py-2 hover:bg-[#f2f7fd] text-[#0b2447]"
              >
                Virtual Card
              </button>
              <button
                disabled
                className="w-full text-left px-4 py-2 text-[#0b2447]/60"
              >
                My Links (soon)
              </button>
              <button
                disabled
                className="w-full text-left px-4 py-2 text-[#0b2447]/60"
              >
                Contact Side (soon)
              </button>
              <button
                disabled
                className="w-full text-left px-4 py-2 text-[#0b2447]/60"
              >
                QR Scan Background (soon)
              </button>
            </div>
          )}
        </li>

        {["Contacts", "Support", "Settings"].map((item) => (
          <li key={item}>
            <button
              className="w-full text-left px-4 py-3 text-md rounded-lg text-[#0b2447] hover:bg-white hover:shadow"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

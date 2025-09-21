import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current URL

  const [activePage, setActivePage] = useState("My Cards");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);

  // This effect runs when the page URL changes
  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === '/' || pathname.startsWith('/edit')) {
      setActivePage("My Cards");
      setIsMyCardsOpen(true); // Automatically open dropdown
    } else if (pathname.startsWith('/contacts')) {
      setActivePage("Contacts");
      setIsMyCardsOpen(false);
    } else if (pathname.startsWith('/support')) {
      setActivePage("Support");
      setIsMyCardsOpen(false);
    } else if (pathname.startsWith('/settings')) {
      setActivePage("Settings");
      setIsMyCardsOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const openAboutEdit = () => {
    // This safely gets the most recently created/edited card ID
    const cardId = localStorage.getItem("personal_card_id");
    if (cardId) {
      navigate(`/edit/about/${cardId}`);
    } else {
      // You can decide what to do if no card ID is found.
      // Maybe navigate to the 'create card' flow or just the home page.
      alert("Please create a card first!");
      navigate("/");
    }
  };

  return (
    // --- RESPONSIVE FIXES APPLIED HERE ---
    // On mobile (default): Takes full width, has a bottom margin (mb-6) to separate from content below.
    // On medium screens (`md:`) and up: Takes 1/5 width, gets a left margin, and bottom margin is removed.
    <aside className="w-full p-4 md:w-1/5 md:ml-6 mb-6 md:mb-0 bg-[#f0f8ff] flex flex-col items-center rounded-xl shadow-md h-fit">
      <ul className="w-full space-y-2">
        {/* My Cards Dropdown */}
        <li>
          <button
            onClick={() => setIsMyCardsOpen((v) => !v)}
            className={`w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between transition-all ${
              activePage === "My Cards"
                ? "bg-white text-[#0b2447] font-semibold shadow"
                : "text-[#0b2447] hover:bg-white hover:shadow"
            }`}
          >
            <span>My Cards</span>
            <ChevronDown
              size={20}
              className={`transition-transform duration-200 ${
                isMyCardsOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          {isMyCardsOpen && (
            <div className="mt-2 ml-2 border border-[#c7def3] bg-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={openAboutEdit}
                className="w-full text-left px-4 py-2 hover:bg-[#f2f7fd] text-[#0b2447]"
              >
                Virtual Card
              </button>
              <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60 cursor-not-allowed">
                My Links (soon)
              </button>
              <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60 cursor-not-allowed">
                Contact Side (soon)
              </button>
              <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60 cursor-not-allowed">
                QR Scan Background (soon)
              </button>
            </div>
          )}
        </li>

        {/* Other Menu Items */}
        {["Contacts", "Support", "Settings"].map((item) => (
          <li key={item}>
            <button
              onClick={() => handleNavigation(`/${item.toLowerCase()}`)}
              className={`w-full text-left px-4 py-3 text-md rounded-lg transition-all ${
                activePage === item
                  ? "bg-white text-[#0b2447] font-semibold shadow"
                  : "text-[#0b2447] hover:bg-white hover:shadow"
              }`}
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
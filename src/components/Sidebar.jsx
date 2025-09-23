import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current URL

  const [activePage, setActivePage] = useState("My Cards");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);
  const [open, setOpen] = useState(false); // mobile menu toggle



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
    <>

      {/* Mobile: just a button */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className=" px-4 py-3 rounded-lg bg-[#d4eafd] text-[#0b2447] font-semibold"
        >
          {open ? "✕ Close Menu" : "☰"}
        </button>
      </div>

      {/* Sidebar (always visible on desktop, toggle on mobile) */}
      {open && (

        <div
          className="fixed inset-x-0 top-24 bottom-0 z-[60]"
          onClick={() => setOpen(false)} // close when clicking backdrop
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/30" />

          <aside
            className="absolute left-0 top-0 h-full w-64 bg-[#f0f8ff] p-4 shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            <ul className="w-full space-y-2">
              {/* My Cards Dropdown */}
              <li>
                {location.pathname.startsWith("/edit") ? (
                  // --- Dropdown on edit pages ---
                  <>
                    <button
                      onClick={() => setIsMyCardsOpen(v => !v)}
                      className={`w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between ${activePage === "My Cards"
                        ? "bg-white text-[#0b2447] font-semibold shadow"
                        : "text-[#0b2447] hover:bg-white hover:shadow"
                        }`}
                    >
                      <span>My Cards</span>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${isMyCardsOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {isMyCardsOpen && (
                      <div className="mt-2 ml-2 border bg-white rounded-lg shadow-sm overflow-hidden">
                        <button
                          onClick={openAboutEdit}
                          className="w-full text-left px-4 py-2 hover:bg-[#f2f7fd] text-[#0b2447]"
                        >
                          Virtual Card
                        </button>
                        <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                          My Links (soon)
                        </button>
                        <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                          Contact Side (soon)
                        </button>
                        <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                          QR Scan Background (soon)
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  // --- Simple button on homepage or other pages ---
                  <button
                    onClick={() => handleNavigation("/home")}
                    className={`w-full text-left px-4 py-3 text-md rounded-lg ${activePage === "My Cards"
                      ? "bg-white text-[#0b2447] font-semibold shadow"
                      : "text-[#0b2447] hover:bg-white hover:shadow"
                      }`}
                  >
                    My Cards
                  </button>
                )}
              </li>

              {/* Other Menu Items */}
              {["Contacts", "Support", "Settings"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNavigation(`/${item.toLowerCase()}`)}
                    className={`w-full text-left px-4 py-3 text-md rounded-lg ${activePage === item
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
        </div>
      )}
      {/* // --- RESPONSIVE FIXES APPLIED HERE ---
    // On mobile (default): Takes full width, has a bottom margin (mb-6) to separate from content below.
    // On medium screens (`md:`) and up: Takes 1/5 width, gets a left margin, and bottom margin is removed. */}
      <aside className="hidden md:block w-full p-4 md:w-1/5 md:ml-6 mb-6 md:mb-0 bg-[#f0f8ff] flex flex-col items-center rounded-xl shadow-md h-fit">
        <ul className="w-full space-y-2">
          {/* My Cards Dropdown */}
          <li>
            {location.pathname.startsWith("/edit") ? (
              // --- Dropdown on edit pages ---
              <>
                <button
                  onClick={() => setIsMyCardsOpen(v => !v)}
                  className={`w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between ${activePage === "My Cards"
                      ? "bg-white text-[#0b2447] font-semibold shadow"
                      : "text-[#0b2447] hover:bg-white hover:shadow"
                    }`}
                >
                  <span>My Cards</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${isMyCardsOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isMyCardsOpen && (
                  <div className="mt-2 ml-2 border bg-white rounded-lg shadow-sm overflow-hidden">
                    <button
                      onClick={openAboutEdit}
                      className="w-full text-left px-4 py-2 hover:bg-[#f2f7fd] text-[#0b2447]"
                    >
                      Virtual Card
                    </button>
                    <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                      My Links (soon)
                    </button>
                    <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                      Contact Side (soon)
                    </button>
                    <button disabled className="w-full text-left px-4 py-2 text-[#0b2447]/60">
                      QR Scan Background (soon)
                    </button>
                  </div>
                )}
              </>
            ) : (
              // --- Simple button on homepage or other pages ---
              <button
                onClick={() => handleNavigation("/home")}
                className={`w-full text-left px-4 py-3 text-md rounded-lg ${activePage === "My Cards"
                    ? "bg-white text-[#0b2447] font-semibold shadow"
                    : "text-[#0b2447] hover:bg-white hover:shadow"
                  }`}
              >
                My Cards
              </button>
            )}
          </li>

          {/* Other Menu Items */}
          {["Contacts", "Support", "Settings"].map((item) => (
            <li key={item}>
              <button
                onClick={() => handleNavigation(`/${item.toLowerCase()}`)}
                className={`w-full text-left px-4 py-3 text-md rounded-lg transition-all ${activePage === item
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
    </>
  );
}
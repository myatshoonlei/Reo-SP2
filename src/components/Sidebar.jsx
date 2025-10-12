import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activePage, setActivePage] = useState("My Cards");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const pathname = location.pathname;
    if (pathname === "/" || pathname.startsWith("/edit")) {
      setActivePage("My Cards");
      setIsMyCardsOpen(true);
    } else if (pathname.startsWith("/contacts")) {
      setActivePage("Contacts");
      setIsMyCardsOpen(false);
    } else if (pathname.startsWith("/support")) {
      setActivePage("Support");
      setIsMyCardsOpen(false);
    } else if (pathname.startsWith("/settings")) {
      setActivePage("Settings");
      setIsMyCardsOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  const openAboutEdit = () => {
    const cardId = localStorage.getItem("personal_card_id");
    if (cardId) navigate(`/edit/about/${cardId}`);
    else {
      alert("Please create a card first!");
      navigate("/");
    }
    setOpen(false);
  };
  const openMyLinksEdit = () => {
    const cardId = localStorage.getItem("personal_card_id");
    if (cardId) navigate(`/edit/mylinks/${cardId}`);
    else {
      alert("Please create a card first!");
      navigate("/");
    }
    setOpen(false);
  };

  const openContactEdit = () => {
    const cardId = localStorage.getItem("personal_card_id");
    if (cardId) navigate(`/edit/contact/${cardId}`);
    else {
      alert("Please create a card first!");
      navigate("/");
    }
    setOpen(false);
  };

  const myCardsSubMenu = [
    { label: "Virtual Card", path: "/edit/about", onClick: openAboutEdit },
    { label: "My Links", path: "/edit/mylinks", onClick: openMyLinksEdit },
    { label: "Card Contact Side", path: "/edit/contact", onClick: openContactEdit },
  ];

  const renderSubMenu = () => (
    <div className="mt-2 ml-2 border border-[#c7def3] bg-white rounded-lg shadow-sm overflow-hidden">
      {myCardsSubMenu.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className={`w-full text-left px-4 py-2 text-[#0b2447] transition-colors ${
            location.pathname.includes(item.path)
              ? "bg-[#d4eafd] font-semibold"
              : "hover:bg-[#f2f7fd]"
          }`}
        >
          {item.label}
        </button>
      ))}
      
    </div>
  );

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

      {/* Sidebar (modal for mobile) */}
      {open && (
        <div
          className="fixed inset-x-0 top-24 bottom-0 z-[60]"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/30" />
          <aside
            className="absolute left-0 top-0 h-full w-64 bg-[#f0f8ff] p-4 shadow-lg z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="w-full space-y-2">
              <li>
                {location.pathname.startsWith("/edit") ? (
                  <>
                    <button
                      onClick={() => setIsMyCardsOpen((v) => !v)}
                      className={`w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between transition-all bg-white text-[#0b2447] font-semibold shadow`}
                    >
                      <span>My Cards</span>
                      <ChevronDown
                        size={20}
                        className={`transition-transform ${
                          isMyCardsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isMyCardsOpen && renderSubMenu()}
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation("/home")}
                    // 👇 MODIFIED: Updated styles for the new UI
                    className={`w-full text-left px-4 py-3 text-md transition-all ${
                      activePage === "My Cards"
                        ? "bg-white text-[#0b2447] font-semibold shadow rounded-lg"
                        : "text-[#0b2447]"
                    }`}
                  >
                    My Cards
                  </button>
                )}
              </li>
              {["Contacts", "Support", "Settings"].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => handleNavigation(`/${item.toLowerCase()}`)}
                    // 👇 MODIFIED: Updated styles for the new UI
                    className={`w-full text-left px-4 py-3 text-md transition-all ${
                      activePage === item
                        ? "bg-white text-[#0b2447] font-semibold shadow rounded-lg"
                        : "text-[#0b2447]"
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

      {/* Sidebar (always visible on desktop) */}
      <aside className="hidden md:block w-full p-4 md:w-1/5 md:ml-6 mb-6 md:mb-0 bg-[#f0f8ff] flex flex-col items-center rounded-xl shadow-md h-fit">
        <ul className="w-full space-y-2">
          <li>
            {location.pathname.startsWith("/edit") ? (
              <>
                <button
                  onClick={() => setIsMyCardsOpen((v) => !v)}
                  className={`w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between transition-all bg-white text-[#0b2447] font-semibold shadow`}
                >
                  <span>My Cards</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${
                      isMyCardsOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isMyCardsOpen && renderSubMenu()}
              </>
            ) : (
              <button
                onClick={() => handleNavigation("/home")}
                // 👇 MODIFIED: Updated styles for the new UI
                className={`w-full text-left px-4 py-3 text-md transition-all ${
                  activePage === "My Cards"
                    ? "bg-white text-[#0b2447] font-semibold shadow rounded-lg"
                    : "text-[#0b2447]"
                }`}
              >
                My Cards
              </button>
            )}
          </li>
          {["Contacts", "Support", "Settings"].map((item) => (
            <li key={item}>
              <button
                onClick={() => handleNavigation(`/${item.toLowerCase()}`)}
                // 👇 MODIFIED: Updated styles for the new UI
                className={`w-full text-left px-4 py-3 text-md transition-all ${
                  activePage === item
                    ? "bg-white text-[#0b2447] font-semibold shadow rounded-lg"
                    : "text-[#0b2447]"
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
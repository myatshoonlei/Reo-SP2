import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [activePage, setActivePage] = useState("My Cards");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);
  const [open, setOpen] = useState(false);

  // Are we editing a TEAM member?
  const isTeamEdit = location.pathname.includes("/edit/team/");
  const { teamId, memberId } = params;

  // Which sub-tab is active?
  const whichSub = (() => {
    const p = location.pathname;
    if (p.includes("/mylinks")) return "mylinks";
    if (p.includes("/contact")) return "contact";
    // default/fallback = about (virtual card)
    return "about";
  })();

  useEffect(() => {
    const p = location.pathname;
    if (p === "/" || p.startsWith("/edit")) {
      setActivePage("My Cards");
      setIsMyCardsOpen(true);
    } else if (p.startsWith("/contacts")) {
      setActivePage("Contacts");
      setIsMyCardsOpen(false);
    } else if (p.startsWith("/support")) {
      setActivePage("Support");
      setIsMyCardsOpen(false);
    } else if (p.startsWith("/settings")) {
      setActivePage("Settings");
      setIsMyCardsOpen(false);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    setOpen(false);
  };

  // Route helpers that resolve to team or personal variants
  const goAbout = () => {
    if (isTeamEdit && teamId && memberId) {
      navigate(`/edit/team/${teamId}/member/${memberId}/about`);
    } else {
      const cardId = localStorage.getItem("personal_card_id");
      if (cardId) navigate(`/edit/about/${cardId}`);
      else {
        alert("Please create a card first!");
        navigate("/");
      }
    }
    setOpen(false);
  };

  const goMyLinks = () => {
    if (isTeamEdit && teamId && memberId) {
      navigate(`/edit/team/${teamId}/member/${memberId}/mylinks`);
    } else {
      const cardId = localStorage.getItem("personal_card_id");
      if (cardId) navigate(`/edit/mylinks/${cardId}`);
      else {
        alert("Please create a card first!");
        navigate("/");
      }
    }
    setOpen(false);
  };

  const goContact = () => {
    if (isTeamEdit && teamId && memberId) {
      navigate(`/edit/team/${teamId}/member/${memberId}/contact`);
    } else {
      const cardId = localStorage.getItem("personal_card_id");
      if (cardId) navigate(`/edit/contact/${cardId}`);
      else {
        alert("Please create a card first!");
        navigate("/");
      }
    }
    setOpen(false);
  };

  const SubButton = ({ label, keyName, onClick }) => {
    const active = whichSub === keyName;
    return (
      <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-[#0b2447] transition-colors ${
          active ? "bg-[#d4eafd] font-semibold" : "hover:bg-[#f2f7fd]"
        }`}
      >
        {label}
      </button>
    );
  };

  const SubMenu = () => (
    <div className="mt-2 ml-2 border border-[#c7def3] bg-white rounded-lg shadow-sm overflow-hidden">
      <SubButton label="Virtual Card" keyName="about" onClick={goAbout} />
      <SubButton label="My Links" keyName="mylinks" onClick={goMyLinks} />
      <SubButton label="Card Contact Side" keyName="contact" onClick={goContact} />
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="md:hidden p-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-3 rounded-lg bg-[#d4eafd] text-[#0b2447] font-semibold"
        >
          {open ? "✕ Close Menu" : "☰"}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-x-0 top-24 bottom-0 z-[60]" onClick={() => setOpen(false)}>
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
                      className="w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between transition-all bg-white text-[#0b2447] font-semibold shadow"
                    >
                      <span>My Cards</span>
                      <ChevronDown size={20} className={`transition-transform ${isMyCardsOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isMyCardsOpen && <SubMenu />}
                  </>
                ) : (
                  <button
                    onClick={() => handleNavigation("/home")}
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

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-full p-4 md:w-1/5 md:ml-6 mb-6 md:mb-0 bg-[#f0f8ff] flex flex-col items-center rounded-xl shadow-md h-fit">
        <ul className="w-full space-y-2">
          <li>
            {location.pathname.startsWith("/edit") ? (
              <>
                <button
                  onClick={() => setIsMyCardsOpen((v) => !v)}
                  className="w-full text-left px-4 py-3 text-md rounded-lg flex items-center justify-between transition-all bg-white text-[#0b2447] font-semibold shadow"
                >
                  <span>My Cards</span>
                  <ChevronDown size={20} className={`transition-transform ${isMyCardsOpen ? "rotate-180" : ""}`} />
                </button>
                {isMyCardsOpen && <SubMenu />}
              </>
            ) : (
              <button
                onClick={() => handleNavigation("/home")}
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

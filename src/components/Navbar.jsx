import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";


export default function Navbar({ onSave, saving, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [displayName, setDisplayName] = useState("");
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("displayName") || "";
    setAuthed(!!token);
    setDisplayName(name);
  }, [location.pathname]); // refresh when route changes

  const isHomePage = location.pathname === "/home";
  const isContactsPage = location.pathname === "/contacts";
  const showEditActions = Boolean(onSave && onClose);

  const initials = (displayName || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 shadow-[0_2px_4px_rgba(0,0,0,0.05)] px-8 py-4 flex justify-between items-center"
      style={{ backgroundColor: "#E2EDF6" }}
    >
      <h1
        className="text-2xl md:text-3xl font-bold font-inter text-reoBlue cursor-pointer"
        onClick={() => navigate("/home")}
      >
        Reo
      </h1>

      <div className="flex items-center gap-3">
        {showEditActions ? (
          <>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-black text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full border"
            >
              Close
            </button>
          </>
        ) : (
          <>

            {authed ? (
              <div className="flex items-center gap-3">
                {/* avatar + name chip */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-sm border">
                  <div className="w-8 h-8 rounded-full bg-[#1E1E1E] text-white grid place-items-center text-sm font-semibold">
                    {initials || "U"}
                  </div>
                  <span className="max-w-[140px] truncate font-medium text-[#1E1E1E]">
                    {displayName || "User"}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-[#1E1E1E] text-white font-outfit px-4 py-2 text-lg rounded-full shadow-md hover:brightness-110 transition"
                >
                  Log out
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#1E1E1E] text-white font-outfit px-1 py-3 text-lg rounded-full shadow-md hover:brightness-110 transition"
              >
                Log in / Sign up
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
}

            {/* {isHomePage || isContactsPage ? (
              <button
                onClick={handleLogout}
                className="bg-[#1E1E1E] text-white font-outfit px-6 py-2 text-lg rounded-full shadow-md hover:brightness-110 transition"
              >
                Log out
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-[#1E1E1E] text-white font-outfit px-6 py-2 text-lg rounded-full shadow-md hover:brightness-110 transition"
              >
                Log in / Sign up
              </button>
            )}
          </>
        )}
      </div>
    </header>
  );
} */}

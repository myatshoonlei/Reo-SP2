import React, { useEffect, useState, useRef, createRef, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CardTile from "../components/CardTile";
import ShareModal from "../components/ShareModal";
import PreviewModal from "../components/PreviewModal";
import TeamFolderTile from "../components/TeamFolderTile";

import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import Template3 from "../components/templates/Template3";
import Template4 from "../components/templates/Template4";
import Template5 from "../components/templates/Template5";
import Template6 from "../components/templates/Template6";
import TemplateVmes from "../components/templates/TemplateVmes";

import { getLogoSrc } from "../server/utils/logoUtils";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const templateMap = {
    template1: Template1,
    template2: Template2,
    template3: Template3,
    template4: Template4,
    template5: Template5,
    template6: Template6,
    templatevmes: TemplateVmes, // <-- Add this line
  };
  const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
  const BASE = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;

  // At the top of your Home.jsx, replace the authHeader function with this:

function authHeader() {
  let t = localStorage.getItem("token") || "";
  // Remove surrounding quotes if present
  if (t.startsWith('"') && t.endsWith('"')) {
    t = t.slice(1, -1);
  }
  // Ensure Bearer prefix (case-insensitive check)
  if (t && !/^bearer /i.test(t)) {
    t = `Bearer ${t}`;
  }
  return { Authorization: t };
}

  const [cards, setCards] = useState([]);
  const tokenRaw = localStorage.getItem("token");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState({
    templateKey: "template1",
    card: {},
  });

    // filter: 'all' | 'personal' | 'teams'
  const [viewMode, setViewMode] = useState('all');

  const [searchParams, setSearchParams] = useSearchParams();
  const sharingCardId = searchParams.get('sharing_card_id');

  const [qrById, setQrById] = useState({});
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // team delete modal
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  // teams
  const [teams, setTeams] = useState([]);
  const [teamCounts, setTeamCounts] = useState({});

  useEffect(() => {
  
    if (location.state?.fromSave && location.state?.cards) {
      console.log("Using cards from navigation state for instant display");
  
      const normalized = location.state.cards.map(c => ({
        ...c,
        logo: getLogoSrc(c.logo),
      }));
      setCards(normalized);
  
      // clear nav state
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      fetchCards();
      fetchTeams();
    }
  }, [location.key, location.state, navigate]);

  // Then in fetchCards, simplify it:
const fetchCards = async () => {
  try {
    const res = await fetch(`${API_URL}/api/personal-card/all`, {
      headers: authHeader(), // Just use authHeader() directly
    });

    if (!res.ok) {
      console.error(`Failed to fetch cards: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch cards: ${res.status}`);
    }

    const data = await res.json();
    console.log("Fetched cards from server:", data);

    const normalized = (Array.isArray(data) ? data : []).map((c) => ({
      ...c,
      logo: getLogoSrc(c.logo),
    }));

    setCards(normalized);
  } catch (error) {
    console.error("Error fetching cards:", error);
    setCards([]);
  }
};

// And in fetchTeams:
const fetchTeams = async () => {
  try {
    const res = await fetch(`${API_URL}/api/teamcard/`, {
      headers: authHeader(), // Just use authHeader() directly
    });

    if (!res.ok) {
      console.error(`Failed to fetch teams: ${res.status} ${res.statusText}`);
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`Failed to fetch teams: ${res.status}`);
    }

    const json = await res.json();
    const list = (json?.data || []).map(t => ({
      ...t,
      logo: getLogoSrc(t.logo),
    }));
    setTeams(list);

    // Fetch counts
    try {
      const cr = await fetch(`${API_URL}/api/teamInfo/counts`, {
        headers: authHeader(),
      });
      if (cr.ok) {
        const cj = await cr.json();
        const map = {};
        (cj?.data || []).forEach(row => (map[row.team_id] = row.count));
        setTeamCounts(map);
      }
    } catch {
      // counts are optional
    }
  } catch (e) {
    console.error("Fetch teams failed:", e);
    setTeams([]);
  }
};

// Also fix confirmTeamDelete - remove the redundant token manipulation:
async function confirmTeamDelete() {
  if (!teamToDelete) return;
  setIsDeletingTeam(true);
  try {
    const res = await fetch(`${API_URL}/api/teamcard/${teamToDelete.teamid}`, {
      method: "DELETE",
      headers: authHeader(), // Just use authHeader() directly
    });
    
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || `Delete failed (${res.status})`);
    }

    setTeams(prev => prev.filter(t => t.teamid !== teamToDelete.teamid));
    setTeamCounts(prev => {
      const next = { ...prev };
      delete next[teamToDelete.teamid];
      return next;
    });
  } catch (e) {
    console.error(e);
    alert(e.message || "Failed to delete team.");
  } finally {
    setIsDeletingTeam(false);
    setTeamToDelete(null);
  }
}
    
      const openTeamFolder = (teamId) => {
        navigate(`/teams/${teamId}`);
      };
  
      const handleDeleteTeamRequest = (team) => setTeamToDelete(team);

      async function confirmTeamDelete() {
        if (!teamToDelete) return;
        setIsDeletingTeam(true);
        try {
          let token = localStorage.getItem("token");
          if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
          if (token?.toLowerCase().startsWith("bearer ")) token = token.slice(7);

          const res = await fetch(`${API_URL}/api/teamcard/${teamToDelete.teamid}`, {
            method: "DELETE",
            headers: { ...authHeader() },
          });
          if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            throw new Error(j?.error || `Delete failed (${res.status})`);
          }
      
          // update UI
          setTeams(prev => prev.filter(t => t.teamid !== teamToDelete.teamid));
          setTeamCounts(prev => {
            const next = { ...prev };
            delete next[teamToDelete.teamid];
            return next;
          });
        } catch (e) {
          console.error(e);
          alert(e.message || "Failed to delete team.");
        } finally {
          setIsDeletingTeam(false);
          setTeamToDelete(null);
        }
      }

const cardToShare = cards.find(card => {
  // This check is important because IDs can sometimes be numbers vs strings
  return String(card.id) === String(sharingCardId);
});


const cardRefs = useRef({});
cards.forEach(card => {
  cardRefs.current[card.id] = cardRefs.current[card.id] ?? createRef();
});

const handleShare = (card) => {
    
  if (!card || !card.id) {
    
    return; // Stop the function if there's no ID
  }
  // ---- END: DEBUGGING LOG ----
  setSearchParams({ sharing_card_id: card.id });
};

const handleCloseModal = () => {
  searchParams.delete('sharing_card_id');
  setSearchParams(searchParams);
};

const handleSingleDeleteRequest = (card) => {
  setCardToDelete(card);
};

const confirmSingleDelete = async () => {
  if (!cardToDelete) return;

  setIsDeleting(true); // 🆕 Start loading

  // Add a small delay to ensure the loading state is visible
  await new Promise(resolve => setTimeout(resolve, 500));

  const token = tokenRaw?.replace(/"/g, "");
  try {
    const res = await fetch(`${API_URL}/api/personal-card/${cardToDelete.id}`, {
      method: 'DELETE',
      headers: { ...authHeader() },
    });

    if (!res.ok) {
      throw new Error(`Failed to delete card: ${res.statusText}`);
    }

    setCards(currentCards => currentCards.filter(c => c.id !== cardToDelete.id));
    setCardToDelete(null);
  } catch (error) {
    console.error("Error deleting card:", error);
    // Optionally show an error message to the user here
    setCardToDelete(null); // Close modal even if there's an error
  } finally {
    setIsDeleting(false); // 🆕 Stop loading in all cases
  }
};

  // Create a new card
  const handleCreateNewCard = () => {
    navigate("/create/card-type");
  };

  // Edit each cards
  const handleEditCard = (c) => {
    navigate(`/edit/about/${c.id}`);
  };

  // Build a single mixed feed for "All"
  const combinedFeed = useMemo(() => {
    const toTS = (v) => {
      // accept created_at / createdAt / created
      const d = v ?? (v?.createdAt) ?? (v?.created);
      return d ? new Date(d).getTime() : null;
    };

    const personal = (cards || []).map((c) => ({
      kind: "personal",
      ts: toTS(c.created_at ?? c.createdAt ?? c.created),
      sortFallback: Number(c.id) || 0,
      card: c,
    }));

    const teamItems = (teams || []).map((t) => ({
      kind: "team",
      ts: toTS(t.created_at ?? t.createdAt ?? t.created),
      sortFallback: Number(t.teamid) || 0,
      team: t,
    }));

    // newest first; if no created_at, fall back to id desc
    return [...personal, ...teamItems].sort((a, b) => {
      const A = a.ts ?? a.sortFallback;
      const B = b.ts ?? b.sortFallback;
      return B - A;
    });
  }, [cards, teams]);


  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar />
      <div className="flex flex-col md:flex-row pt-24">
        <Sidebar />
        <main className="w-full md:w-4/5 p-6">
  <ShareModal
    card={cardToShare}
    onClose={handleCloseModal}
    cardRef={cardToShare ? cardRefs.current[cardToShare.id] : null}
    TemplateComponent={cardToShare ? templateMap[cardToShare.component_key] : null}
  />
  {showPreview && (
    <PreviewModal
      open={showPreview}
      templateKey={preview.templateKey}
      card={preview.card}
      onClose={() => {
        setShowPreview(false);
        fetchCards();
      }}
      onDone={() => {
        setShowPreview(false);
        fetchCards();
      }}
    />
  )}

  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-[#0b2447]">
    {viewMode === 'all'
      ? 'All Cards'
      : viewMode === 'personal'
      ? 'Personal'
      : 'Teams'}
    </h1>

    <div className="inline-flex items-center rounded-lg border bg-white shadow-sm overflow-hidden">
      {[
        { key: 'all', label: 'All' },
        { key: 'personal', label: 'Personal' },
        { key: 'teams', label: 'Teams' },
      ].map(opt => (
        <button
          key={opt.key}
          onClick={() => setViewMode(opt.key)}
          className={`px-3 py-1.5 text-sm transition ${
            viewMode === opt.key
              ? 'bg-blue-600 text-white'
              : 'text-[#0b2447] hover:bg-gray-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>

  {/* --- Delete Confirmation Modal --- */}
  {cardToDelete && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Card?</h2>
                <p className="text-gray-600 mb-6">Are you sure you want to delete the card for <strong>{cardToDelete.fullname}</strong>?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCardToDelete(null)}
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSingleDelete}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-32 flex items-center justify-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

{/* ALL: unified feed */}
{viewMode === 'all' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Create tile pinned first */}
    <button
      onClick={handleCreateNewCard}
      className="w-full h-[200px] rounded-xl shadow-md bg-[#d4eafd] hover:bg-[#c5dbec] flex flex-col items-center justify-center transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-[#0b2447] text-white flex items-center justify-center text-2xl font-bold mb-2">+</div>
      <span className="text-base font-semibold text-[#576cbc]">Create New Card</span>
    </button>

    {/* Mixed items */}
    {combinedFeed.map((item) => {
      if (item.kind === 'personal') {
        const c = item.card;
        const TemplateComponent = templateMap[c.component_key];
        if (!TemplateComponent) return null;
        return (
          <CardTile
            key={`p-${c.id}`}
            card={c}
            TemplateComponent={TemplateComponent}
            onEdit={handleEditCard}
            onShare={handleShare}
            onDelete={handleSingleDeleteRequest}
            isSelectMode={false}
          />
        );
      }
      const t = item.team;
      return (
        <TeamFolderTile
          key={`t-${t.teamid}`}
          team={t}
          count={teamCounts[t.teamid] ?? 0}
          onOpen={openTeamFolder}
          onDelete={handleDeleteTeamRequest}   // <-- add this
          tileHeightClass="h-[200px]"
        />
      );
    })}
  </div>
)}

{/* PERSONAL tab only */}
{viewMode === 'personal' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <button
      onClick={handleCreateNewCard}
      className="w-full h-[200px] rounded-xl shadow-md bg-[#d4eafd] hover:bg-[#c5dbec] flex flex-col items-center justify-center transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-[#0b2447] text-white flex items-center justify-center text-2xl font-bold mb-2">+</div>
      <span className="text-base font-semibold text-[#576cbc]">Create New Card</span>
    </button>

    {cards.map((card) => {
      const TemplateComponent = templateMap[card.component_key];
      if (!TemplateComponent) return null;
      return (
        <CardTile
          key={card.id}
          card={card}
          TemplateComponent={TemplateComponent}
          onEdit={(c) => navigate(`/edit/about/${card.id}`)} // 👈 here
          onShare={handleShare}
          onDelete={handleSingleDeleteRequest}
          isSelectMode={false}
        />
      );
    })}
  </div>
)}

{/* TEAMS tab only */}
{viewMode === 'teams' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Create tile (same size as a card/folder) */}
    <button
      onClick={handleCreateNewCard}              // keeps sending to /create/card-type
      className="w-full h-[200px] rounded-xl shadow-md bg-[#d4eafd] hover:bg-[#c5dbec] flex flex-col items-center justify-center transition-colors"
    >
      <div className="w-12 h-12 rounded-full bg-[#0b2447] text-white flex items-center justify-center text-2xl font-bold mb-2">
        +
      </div>
      <span className="text-base font-semibold text-[#576cbc]">
        Create New Card
      </span>
    </button>

    {/* Team folders */}
    {teams.map((t) => (
    <TeamFolderTile
      key={t.teamid}
      team={t}
      count={teamCounts[t.teamid] ?? 0}
      onOpen={openTeamFolder}
      onDelete={handleDeleteTeamRequest}   // <-- add this
      tileHeightClass="h-[200px]"
    />
  ))}
  </div>
)}

{teamToDelete && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Team?</h2>
      <p className="text-gray-600 mb-6">
        This will permanently delete <strong>{teamToDelete.company_name}</strong> and all its members.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setTeamToDelete(null)}
          className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
          disabled={isDeletingTeam}
        >
          Cancel
        </button>
        <button
  onClick={confirmTeamDelete}
  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-36 flex items-center justify-center"
  disabled={isDeletingTeam}
>
  {isDeletingTeam ? (
    <>
      <svg
        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M12 2a10 10 0 00-10 10h4a6 6 0 1112 0h4A10 10 0 0012 2z"
        />
      </svg>
      Deleting…
    </>
  ) : (
    "Delete"
  )}
</button>

      </div>
    </div>
  </div>
)}


</main>

      </div>
    </div>
  );
}
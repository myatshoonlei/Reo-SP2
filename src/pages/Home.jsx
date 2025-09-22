import React, { useEffect, useState, useRef, createRef } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CardTile from "../components/CardTile";
import ShareModal from "../components/ShareModal";
import PreviewModal from "../components/PreviewModal";

import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import Template3 from "../components/templates/Template3";
import Template4 from "../components/templates/Template4";
import Template5 from "../components/templates/Template5";
import Template6 from "../components/templates/Template6";

import { getLogoSrc } from "../utils/logoUtils";

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
  };

  const [cards, setCards] = useState([]);
  const tokenRaw = localStorage.getItem("token");
  const [isMyCardsOpen, setIsMyCardsOpen] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState({
    templateKey: "template1",
    card: {},
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const sharingCardId = searchParams.get('sharing_card_id');

  const [qrById, setQrById] = useState({});
  const [cardToDelete, setCardToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
    }
  }, [location.key, location.state, navigate]);

  const fetchCards = async () => {
    let token = tokenRaw;
    if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
    if (token?.toLowerCase().startsWith("bearer ")) token = token.slice(7);
  
    if (!token) {
      setCards([]);
      return;
    }
  
    try {
      const res = await fetch("http://localhost:5000/api/personal-card/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch cards: ${res.status} ${res.statusText}`);
      }
  
      const data = await res.json();
      console.log("Fetched cards from server:", data);
  
      // Normalize logos so no raw '/9j/...' strings reach <img>
      const normalized = (Array.isArray(data) ? data : []).map((c) => ({
        ...c,
        logo: getLogoSrc(c.logo),
      }));
  
      setCards(normalized);
    } catch (error) {
      console.error("Error fetching cards:", error);
      setCards([]); // fail-safe
    }
  };
  
// Share: try Web Share API; otherwise copy URL
const handleShareCard = async (c) => {
  const url = `${window.location.origin}/card/${c.id}`;
  try {
    if (navigator.share) {
      await navigator.share({ title: c.fullname || "My Card", url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Share link copied to clipboard!");
    }
  } catch {
    await navigator.clipboard.writeText(url);
    alert("Share link copied to clipboard!");
  }
};

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

// Delete: call your API then refresh
const handleDeleteCard = async (c) => {
  if (!confirm("Delete this card?")) return;

  let token = tokenRaw;
  if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
  if (token?.toLowerCase().startsWith("bearer ")) token = token.slice(7);

  try {
    const res = await fetch(`http://localhost:5000/api/personal-card/${c.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
    await fetchCards();
  } catch (e) {
    console.error(e);
    alert("Could not delete. Please try again.");
  }
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
    const res = await fetch(`http://localhost:5000/api/personal-card/${cardToDelete.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
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

// Home.jsx
const handleEditCard = (c) => {
  navigate(`/edit/about/${c.id}`);
};

const openAboutEdit = () => {
  const c = cards?.[0];
  if (!c) return alert("No card yet. Create one first.");
  navigate(`/edit/about/${c.id}`);
};



  const handleCreateNewCard = () => {
    navigate("/create/card-type");
  };

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
          <h1 className="text-2xl font-bold text-[#0b2447] mb-6 flex items-center gap-2">
            My Cards
            {/* <span className="text-xs bg-[#0b2447] text-white px-2 py-[2px] rounded-full">+</span> */}
          </h1>

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
          
          <button
            onClick={handleCreateNewCard}
            className="bg-[#d4eafd] w-64 h-40 rounded-xl shadow-md flex flex-col justify-center items-center mb-10 focus:outline-none hover:bg-[#c5dbec] transition-colors"
          >
            <div className="bg-[#0b2447] w-10 h-10 flex items-center justify-center rounded-full text-white text-xl font-bold mb-2">+</div>
            <span className="text-lg font-semibold text-[#576cbc]">Create New Card</span>
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => {
              const TemplateComponent = templateMap[card.component_key];
              if (!TemplateComponent) return null;
              return (
                <CardTile
                  key={card.id}
                  card={card}
                  TemplateComponent={TemplateComponent}
                  onEdit={handleEditCard}
                  // onShare={handleShareCard}
                  onShare={handleShare}
                  // onDelete={handleDeleteCard}
                  onDelete={handleSingleDeleteRequest}
                  isSelectMode={false}   // you can toggle this later if you add bulk actions
                />
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

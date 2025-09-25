// TeamCompanyModal.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const TeamCompanyModal = ({
  // these are optional; you aren't passing them from App.jsx
  teamId,
  setTeamId,
  resetForm,
  setResetForm,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // effective team id: nav state -> prop -> localStorage
  const navTeamId = location.state?.teamId ?? null;
  const lsTeamId = (() => {
    const raw = localStorage.getItem("team_card_id");
    return raw && raw !== "null" && raw !== "undefined" ? Number(raw) : null;
  })();
  const effectiveTeamId = navTeamId || teamId || lsTeamId || null;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyName, setCompanyName] = useState("");

  // draft key for persistence across steps (scoped per team)
  const DRAFT_KEY = effectiveTeamId
    ? `team_company_name_draft:${effectiveTeamId}`
    : "team_company_name_draft:new";

  // hydrate from draft (and optionally server) on mount / team change
  useEffect(() => {
    // 1) load local draft first
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      setCompanyName(draft);
      return;
    }

    // 2) optional: try server if we have an id (safe no-op if endpoint doesn’t exist)
    const fetchExisting = async () => {
      if (!effectiveTeamId) return;
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/teamcard/${effectiveTeamId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const existing = json?.data?.companyname || json?.data?.companyName;
          if (existing) {
            setCompanyName(existing);
            localStorage.setItem(DRAFT_KEY, existing);
          }
        }
      } catch {
        /* ignore */
      }
    };
    fetchExisting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [DRAFT_KEY, effectiveTeamId]);

  // keep draft up to date while typing
  useEffect(() => {
    if (companyName != null) {
      localStorage.setItem(DRAFT_KEY, companyName);
    }
  }, [companyName, DRAFT_KEY]);

  // remove any auto-clear on Back; just go back to card type
  const handleBack = () => {
    // DO NOT clear companyName here; we want it to persist
    // setResetForm?.(true); // ❌ remove this so it doesn’t wipe your input
    navigate("/create/card-type");
  };

  const handleNext = async () => {
    if (companyName.trim() === "") {
      alert("Please enter the company name.");
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Authentication token not found. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const method = effectiveTeamId ? "PUT" : "POST";
      const url = effectiveTeamId
        ? `${API_BASE}/api/teamcard/${effectiveTeamId}`
        : `${API_BASE}/api/teamcard`;

      const { data } = await axios({
        method,
        url,
        data: { companyName },
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      const newTeamId = data?.data?.teamid ?? data?.teamid ?? effectiveTeamId;
      if (newTeamId) {
        setTeamId?.(newTeamId);
        localStorage.setItem("team_card_id", String(newTeamId));

        // migrate draft key if we just created the team
        if (!effectiveTeamId && companyName) {
          localStorage.setItem(`team_company_name_draft:${newTeamId}`, companyName);
          localStorage.removeItem("team_company_name_draft:new");
        }
      }

      navigate("/create/company-logo", {
        state: {
          cardType: "Team",
          teamId: newTeamId || effectiveTeamId || Number(localStorage.getItem("team_card_id")),
        },
      });
    } catch (error) {
      console.error(
        "Error creating/updating team card:",
        error.response ? error.response.data : error.message
      );
      alert("Failed to process team card. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[340px]">
        <h2 className="font-semibold text-gray-600 text-sm mb-1 text-center">Step 1</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-1 text-center">Organization Details</h3>
        <p className="text-xs text-gray-500 mb-4 text-center">
          Create Business Cards for your organization in seconds
        </p>

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">Organization Name</label>
          <input
            type="text"
            placeholder="Enter Your Organization Name"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <div className="flex justify-center gap-2">
          <button
            onClick={handleBack}
            className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100"
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="bg-blue-400 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-500 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCompanyModal;
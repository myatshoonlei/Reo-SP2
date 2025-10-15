import { useEffect, useState, createRef, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import CardTile from "../components/CardTile";
import ShareModal from "../components/ShareModal";
import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import Template3 from "../components/templates/Template3";
import Template4 from "../components/templates/Template4";
import Template5 from "../components/templates/Template5";
import Template6 from "../components/templates/Template6";
import TemplateVmes from "../components/templates/TemplateVmes";

import { getLogoSrc } from "../server/utils/logoUtils";

const templateMap = {
  template1: Template1,
  template2: Template2,
  template3: Template3,
  template4: Template4,
  template5: Template5,
  template6: Template6,
  templatevmes: TemplateVmes,
};

export default function TeamMembersPage() {
  const API_URL=import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { teamId } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(true);

  // delete modal state
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);

  // share modal state via URL param
  const [searchParams, setSearchParams] = useSearchParams();
  const sharingMemberId = searchParams.get("share_member_id");

  // ref per member (for screenshot/preview inside ShareModal if you use it)
  const memberRefs = useRef({});
  members.forEach((m) => {
    memberRefs.current[m.id] = memberRefs.current[m.id] ?? createRef();
  });

  const memberToShare = members.find(
    (m) => String(m.id) === String(sharingMemberId)
  );

  const openShareModal = (m) => {
    setSearchParams({ share_member_id: m.id });
  };

  const closeShareModal = () => {
    searchParams.delete("share_member_id");
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const fetchMembers = async () => {
      let token = localStorage.getItem("token");
      if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
      if (token?.toLowerCase().startsWith("bearer ")) token = token.slice(7);

      if (!token) {
        setMembers([]);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/teamInfo/${teamId}/members`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const json = await res.json();

        const normalized = (json?.data || []).map((row) => ({
          ...row,
          logo: getLogoSrc(row.logo),
        }));

        setMembers(normalized);
        setTeamName(normalized[0]?.team_company_name || "");
      } catch (e) {
        console.error(e);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [teamId]);

  async function confirmMemberDelete() {
    if (!memberToDelete) return;
    setIsDeletingMember(true);
    try {
      let token = localStorage.getItem("token");
      if (token?.startsWith('"') && token?.endsWith('"')) token = token.slice(1, -1);
      if (token?.toLowerCase().startsWith("bearer ")) token = token.slice(7);

      const res = await fetch(
        `${API_URL}/api/teamInfo/member/${memberToDelete.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error || `Delete failed (${res.status})`);
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
    } catch (e) {
      console.error(e);
      alert(e.message || "Failed to delete member.");
    } finally {
      setIsDeletingMember(false);
    }
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar />
      <div className="flex flex-col md:flex-row pt-24">
        <Sidebar />
        <main className="w-full md:w-4/5 p-6">
        <ShareModal
            card={memberToShare}
            onClose={closeShareModal}
            cardRef={memberToShare ? memberRefs.current[memberToShare.id] : null}
            TemplateComponent={memberToShare ? templateMap[memberToShare.component_key] : null}
            shareUrl={
                memberToShare
                ? `${window.location.origin}/team/${memberToShare.team_id}/member/${memberToShare.id}`
                : undefined
            }
            />


          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#0b2447]">
              {teamName ? `${teamName} — Team Cards` : "Team Cards"}
            </h1>
            <button
              onClick={() => navigate("/home")}
              className="group inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-[#0b2447] text-white shadow-md hover:shadow-lg hover:bg-[#0a1f3d] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0b2447] focus-visible:ring-offset-2"
              aria-label="Back to Home"
            >
              <ChevronLeft className="w-5 h-5 -ml-1 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          {loading ? (
            <p className="text-gray-600">Loading team members…</p>
          ) : members.length === 0 ? (
            <p className="text-gray-600">No members yet for this team.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((m) => {
                const TemplateComponent = templateMap[m.component_key] || Template1;
                return (
                  <CardTile
                    key={m.id}
                    card={m}
                    TemplateComponent={TemplateComponent}
                    onEdit={(m) => navigate(`/edit/team/${m.team_id}/member/${m.id}`)}
                    onShare={() => openShareModal(m)}   // ✅ opens ShareModal with correct link
                    onDelete={() => setMemberToDelete(m)}
                    isSelectMode={false}
                  />
                );
              })}
            </div>
          )}

          {/* Delete confirmation modal */}
          {memberToDelete && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Member?</h2>
                <p className="text-gray-600 mb-6">
                  This will permanently delete <strong>{memberToDelete.fullname}</strong> from the team.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setMemberToDelete(null)}
                    className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                    disabled={isDeletingMember}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmMemberDelete}
                    className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed w-36 flex items-center justify-center"
                    disabled={isDeletingMember}
                  >
                    {isDeletingMember ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                        Deleting…
                      </span>
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
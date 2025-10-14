// src/hooks/useEditApi.js
import { useParams } from "react-router-dom";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useAuthHeader() {
  let raw = localStorage.getItem("token") || "";
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  if (raw && !/^bearer /i.test(raw)) raw = `Bearer ${raw}`;
  return { Authorization: raw };
}

export default function useEditApi(mode = "personal") {
  const { cardId, teamId, memberId } = useParams();
  const headers = useAuthHeader();

  if (/^team/i.test(mode)) {
        const tId = teamId;
        let dynamicMemberId = memberId ? Number(memberId) : null;

  const resolveId = async () => {
         if (dynamicMemberId) return dynamicMemberId;
         const first = await fetch(`${API_BASE}/api/teamInfo/first?teamId=${tId}`, { headers });
         if (!first.ok) throw new Error("No members in this team yet");
         const firstData = await first.json();
         dynamicMemberId = Number(firstData?.data?.id) || null;
         if (!dynamicMemberId) throw new Error("Could not resolve a team member id");
         return dynamicMemberId;
       };

    return {
      get id() { return dynamicMemberId; }, // for debugging/reads
      teamId: tId,

      // Load member data; if no memberId, fallback to first member of the team.
      load: async () => {
        // 1) resolve member id if missing
        const memberId = await resolveId();
        const r = await fetch(`${API_BASE}/api/teamInfo/member/${memberId}`, { headers });
        if (!r.ok) throw new Error("Failed to load team member");
        const memberData = await r.json();

        // 3) fetch team card styling (authoritative logo/colors/font/template)
        const teamRes = await fetch(`${API_BASE}/api/teamcard/${tId}/details`, { headers });
        if (!teamRes.ok) throw new Error("Failed to load team styling");
        const teamData = await teamRes.json();

        return {
          data: {
            ...teamData.data,       // logo, colors, font_family, template_id, company_name
            ...memberData.data,     // member text fields override where present
            primary_color: teamData.data.primary_color,
            secondary_color: teamData.data.secondary_color,
            font_family: teamData.data.font_family,
            logo: teamData.data.logo,
            template_id: teamData.data.template_id,
            company_name: teamData.data.company_name,
          }
        };
      },

      // Save ONLY member text fields (uses resolved id)
      save: async (payload) =>
        fetch(`${API_BASE}/api/teamInfo/member/${await resolveId()}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        }),

      // Upload member profile photo (uses resolved id)
      uploadProfile: async (file) => {
        const fd = new FormData();
        fd.append("profile", file);
        return fetch(`${API_BASE}/api/teamInfo/member/${await resolveId()}/profile-photo`, {
          method: "POST",
          headers,
          body: fd,
        });
      },

      // Save team-wide styling (logo/colors/font/template) on team_cards
      saveTeamStyling: (stylingPayload) =>
        fetch(`${API_BASE}/api/teamcard/${tId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(stylingPayload),
        }),

      // Upload team logo via data URL (kept for convenience)
      uploadLogo: (file) => {
        const fd = new FormData();
        fd.append("logo", file);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const response = await fetch(`${API_BASE}/api/teamcard/${tId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify({ logo: reader.result }),
              });
              resolve(response);
            } catch (e) { reject(e); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      },

      readOnly: { companyName: true, template: true },
      context: { teamId: tId },
    };
  }

  // ----- personal mode unchanged -----
  // personal mode
  const id = cardId;
  return {
    id,
    
    load: async () => {
      const r = await fetch(`${API_BASE}/api/personal-card/${id}`, { headers });
      if (!r.ok) throw new Error("Failed to load card");
      return r.json();
    },
    
    save: (payload) =>
      fetch(`${API_BASE}/api/personal-card/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(payload),
      }),
    
    uploadProfile: (file) => {
      const fd = new FormData();
      fd.append("profile", file);
      fd.append("cardId", id);
      return fetch(`${API_BASE}/api/profile-photo`, { 
        method: "POST", 
        headers, 
        body: fd 
      });
    },
    
    uploadLogo: (file) => {
      const fd = new FormData();
      fd.append("logo", file);
      fd.append("cardType", "Myself");
      fd.append("cardId", id);
      return fetch(`${API_BASE}/api/upload-logo`, { 
        method: "POST", 
        headers, 
        body: fd 
      });
    },
    
    readOnly: {},
    context: {},
  };
}
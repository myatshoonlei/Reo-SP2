// src/hooks/useEditApi.js
import { useParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// pull token from localStorage and make sure it looks like: "Bearer <token>"
export function useAuthHeader() {
  let raw = localStorage.getItem("token") || "";
  // strip accidental surrounding quotes
  if (raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);
  // ensure Bearer prefix
  if (raw && !/^bearer /i.test(raw)) raw = `Bearer ${raw}`;
  return { Authorization: raw };
}

export default function useEditApi(mode = "personal") {
  const { cardId, teamId, memberId } = useParams();
  const headers = useAuthHeader();

  if (mode === "team") {
    const id = memberId;
    const tId = teamId;
    
    return {
      id,
      teamId: tId,
      
      // Load member data + team styling (colors, logo, template)
      load: async () => {
        const r = await fetch(`${API_BASE}/api/teamInfo/member/${id}`, { headers });
        if (!r.ok) throw new Error("Failed to load team member");
        const memberData = await r.json();
        
        // Also fetch team card details for styling
        const teamRes = await fetch(`${API_BASE}/api/teamcard/${tId}/details`, { headers });
        if (!teamRes.ok) throw new Error("Failed to load team styling");
        const teamData = await teamRes.json();
        
        // Merge: member fields override team fields where they exist
        return {
          data: {
            ...teamData.data,
            ...memberData.data,
            // Ensure we keep team-level styling
            primary_color: teamData.data.primary_color,
            secondary_color: teamData.data.secondary_color,
            logo: teamData.data.logo,
            template_id: teamData.data.template_id,
          }
        };
      },
      
      // Save member text fields only
      save: (payload) =>
        fetch(`${API_BASE}/api/teamInfo/member/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        }),
      
      // Upload member profile photo
      uploadProfile: (file) => {
        const fd = new FormData();
        fd.append("profile", file);
        return fetch(`${API_BASE}/api/teamInfo/member/${id}/profile-photo`, {
          method: "POST",
          headers,
          body: fd,
        });
      },
      
      // Save team-level styling (colors)
      saveTeamStyling: (payload) =>
        fetch(`${API_BASE}/api/teamcard/${tId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify(payload),
        }),
      
      // Upload team logo
      uploadLogo: (file) => {
        const fd = new FormData();
        fd.append("logo", file);
        // Convert to data URL for the API
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
            } catch (e) {
              reject(e);
            }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      },
      
      readOnly: { companyName: true, template: true },
      context: { teamId: tId },
    };
  }

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
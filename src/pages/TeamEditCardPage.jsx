import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";  // You can reuse the Navbar component
import Sidebar from "../components/Sidebar";  // You can reuse the Sidebar component

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

export default function TeamEditCardPage() {
  const token = localStorage.getItem("token");
  const { cardId } = useParams(); // Get cardId from the route
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // State for the form fields
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [logo, setLogo] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#1F2937");
  const [secondaryColor, setSecondaryColor] = useState("#f5f9ff");

  // Fetch the team card data on load
  useEffect(() => {
    const loadCardData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/teamcard/${cardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load team card data");

        const data = await res.json();
        setCompanyName(data.data.company_name || "");
        setJobTitle(data.data.job_title || "");
        setPhoneNumber(data.data.phone_number || "");
        setEmail(data.data.email || "");
        setLogo(data.data.logo || null);
        setPrimaryColor(data.data.primary_color || "#1F2937");
        setSecondaryColor(data.data.secondary_color || "#f5f9ff");
      } catch (error) {
        setErr("Failed to load team card data");
      } finally {
        setLoading(false);
      }
    };

    if (cardId) {
      loadCardData();
    }
  }, [cardId, token]);

  // Handle saving the updated card
  const saveCard = async () => {
    try {
      setSaving(true);
      const res = await fetch(`${API_BASE}/api/teamcard/${cardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName,
          jobTitle,
          phoneNumber,
          email,
          logo,
          primaryColor,
          secondaryColor,
        }),
      });

      if (!res.ok) throw new Error("Failed to save changes");

      const data = await res.json();
      setOk("Team card updated successfully!");
      setSaving(false);
      navigate(`/team/${cardId}`); // Redirect to the team card page
    } catch (error) {
      setErr("Failed to save changes");
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar onSave={saveCard} saving={saving} onClose={() => navigate("/home")} />
      <div className="flex pt-24">
        <Sidebar activePage="Edit Team Card" />
        <div className="flex-1 px-6 pt-4">
          {(err || ok) && (
            <div className="pt-3">
              {err && (
                <div className="mb-2 p-2 rounded bg-red-50 text-red-700">
                  {err}
                </div>
              )}
              {ok && (
                <div className="mb-2 p-2 rounded bg-green-50 text-green-700">
                  {ok}
                </div>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-white p-4">
            <div className="mb-4">
              <label className="block">Company Name</label>
              <input
                type="text"
                className="w-full border p-2 mt-2"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block">Job Title</label>
              <input
                type="text"
                className="w-full border p-2 mt-2"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block">Phone Number</label>
              <input
                type="text"
                className="w-full border p-2 mt-2"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block">Email</label>
              <input
                type="email"
                className="w-full border p-2 mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block">Logo</label>
              <input
                type="file"
                className="w-full border p-2 mt-2"
                onChange={(e) => setLogo(e.target.files[0])}
              />
            </div>

            <div className="mb-4">
              <label className="block">Primary Color</label>
              <input
                type="color"
                className="w-full border p-2 mt-2"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block">Secondary Color</label>
              <input
                type="color"
                className="w-full border p-2 mt-2"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
              />
            </div>

            <button
              onClick={saveCard}
              disabled={saving}
              className="bg-blue-500 text-white p-2 rounded mt-4"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

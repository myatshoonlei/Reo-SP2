import { useEffect, useState } from "react";
import Template1 from "../components/templates/Template1";
import Template2 from "../components/templates/Template2";
import { useNavigate } from "react-router-dom";


const TemplateSelectionPage = ({ onBack }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCard = async () => {
      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          "http://localhost:5000/api/personal-card/details",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch card info");

        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("❌ Error loading card info", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const sanitizeColor = (color) => {
    if (!color) return "#000000";
    return color.replace(/^['"]+|['"]+$/g, ""); // remove leading/trailing quotes
  };

  const cardInfo = {
    name: userData?.fullname || "Name",
    title: userData.job_title,
    company: userData.company_name,
    email: userData.email,
    phone: userData.phone_number,
    logo: userData.logo
      ? `data:image/png;base64,${userData.logo}`
      : "/default-logo.png",
    primary_color: sanitizeColor(userData.primary_color),
    secondary_color: sanitizeColor(userData.secondary_color),
  };
  console.log("✅ Primary Color:", cardInfo.primary_color);
  console.log("✅ Secondary Color:", cardInfo.secondary_color);

  return (
    <div className="min-h-screen bg-[#EDF5FD] font-inter">
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#0B2447]">Reo</h1>
        <button className="text-[#0B2447] border border-[#0B2447] px-4 py-1 rounded hover:bg-[#f0f0f0]">
          Log out
        </button>
      </nav>

      {/* Main Content */}
      <div className="px-10 py-6">
        <h2 className="text-xl font-bold text-[#0B2447] mb-6">
          Choose a template for Your Business Card
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <Template1 {...cardInfo} />
          <Template2 {...cardInfo} />
        </div>

        <div className="mt-10 flex justify-between">
          <button
  onClick={() => {
    if (onBack) {
      onBack(); // used inside modal flow
    } else {
      navigate(-1); // fallback if accessed directly via route
    }
  }}
  className="border border-[#0B2447] text-[#0B2447] px-6 py-2 rounded hover:bg-[#e7edf6]"
>
  ← Previous
</button>

          <button
            onClick={() => alert("Template selected!")}
            className="bg-[#0B2447] text-white px-6 py-2 rounded hover:bg-[#132a58]"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelectionPage;
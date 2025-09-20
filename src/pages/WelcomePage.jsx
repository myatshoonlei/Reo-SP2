import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import Navbar from "../components/Navbar";

const WelcomePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const features = [
    [
      "🎨 Create Your Card",
      "Enter your name, title, contact info — make it uniquely yours.",
    ],
    [
      "🖼️ Choose Templates",
      "Pick from modern, professional designs to match your style.",
    ],
    [
      "🔗 Share Instantly",
      "Share your card via link or QR code with anyone, anywhere.",
    ],
    [
      "📱 Save to Contacts",
      "Others can tap and instantly save your contact details.",
    ],
    [
      "📎 Download as PNG",
      "Save your card image and use it anywhere — email, socials, etc.",
    ],
    [
      "🛠️ Edit Anytime",
      "Need changes? Update your card details anytime with ease.",
    ],
  ];

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-reoLight to-[#C5DBEC] text-dark">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 w-full h-[100vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-outfit font-bold mb-4">
          Your Ultimate Virtual Business Card
        </h2>
        <p className="text-lg font-medium mb-4">
          Connect with clients and peers anytime, anywhere.
        </p>
        <p className="text-sm text-gray-600 max-w-xl mb-6">
          Easily create, share, and manage digital business cards effortlessly.
          <br />
          Our platform turns every interaction into an opportunity.
        </p>
        <button
          className="bg-reoBlue text-white px-6 py-3 rounded-2xl font-semibold hover:opacity-90 transition"
          onClick={() => navigate("/create-account")}
        >
          Get Started Now
        </button>
      </section>

      {/* Features Section */}
      <section className="w-full min-h-screen px-6 py-16 bg-white flex justify-center items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl w-full">
          {features.map(([title, desc], i) => (
            <div
              key={i}
              className="bg-[#f0f8ff] rounded-xl p-6 transition hover:bg-[#e6f3fc] hover:shadow-lg"
              data-aos="fade-up"
            >
              <h3 className="text-xl font-semibold text-reoBlue mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;

import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-50 !bg-reoLight shadow-[0_2px_4px_rgba(0,0,0,0.05)] px-8 py-4 flex justify-between items-center"
      style={{ backgroundColor: "#E2EDF6" }}
      >
      <h1 className="text-2xl md:text-3xl font-bold font-inter text-reoBlue">
        Reo
      </h1>
      <div className="space-x-4">
        <button className="text-reoBlue font-medium hover:underline">
          Home
        </button>
        <button className="text-reoBlue font-medium hover:underline">
          Features
        </button>
        <button
          style={{ color: "white" }}
          className="bg-[#1E1E1E] text-white font-outfit px-6 py-2 text-lg rounded-full shadow-md hover:brightness-110 transition"
          onClick={() => navigate("/login")}
        >
          Log in / Sign up
        </button>
      </div>
    </header>
  );
}

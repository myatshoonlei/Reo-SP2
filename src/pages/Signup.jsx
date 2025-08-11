import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "../assets/googleIcon.png";

export default function Signup() {
  const navigate = useNavigate();

  // 👇 State for form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 👇 Function to handle form submission
  const handleSignup = async () => {
    if (password.length < 8) {
    return alert("Password must be at least 8 characters.");
  }
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname: fullName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Account created!");
        navigate("/login");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC] px-4 font-inter">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-3xl font-bold text-black mb-10">Create an account</h1>

        {/* Full Name */}
        <div className="text-left mb-5">
          <label className="block text-sm font-semibold text-black mb-1">Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Email */}
        <div className="text-left mb-5">
          <label className="block text-sm font-semibold text-black mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Password */}
        <div className="text-left mb-6">
          <label className="block text-sm font-semibold text-black mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Divider */}
        <div className="text-sm text-gray-500 mb-4 text-center">Or</div>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 bg-white hover:shadow-sm mb-6">
          <img src={googleIcon} alt="Google" className="w-4 h-4" />
          <span className="text-sm font-medium text-black">Continue with Google</span>
        </button>

        {/* Already have account */}
        <p className="text-sm text-black mb-6">
          already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>

        {/* Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full bg-[#D9D9D9] text-black font-medium"
          >
            Back
          </button>
          <button
            onClick={handleSignup}
            className="px-6 py-2 rounded-full bg-black text-white font-medium"
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
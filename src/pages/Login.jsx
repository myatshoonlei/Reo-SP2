<<<<<<< HEAD
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "../assets/googleIcon.png";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save JWT token to localStorage (optional, if you want to use token-based auth)
        localStorage.setItem("token", data.token);

        // Navigate to Home page
        navigate("/home");
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
        <h1 className="text-3xl font-bold text-black mb-10">Log in</h1>

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
=======
import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC] font-outfit px-4">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-dark mb-8">
        Log in
      </h1>

      <div className="w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d
          />
          <div className="text-right mt-1">
            <Link to="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

<<<<<<< HEAD
        <div className="text-sm text-gray-500 mb-4">Or</div>

        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-md py-2 bg-white hover:shadow-sm mb-6">
          <img src={googleIcon} alt="Google" className="w-5 h-5" />
          <span className="text-sm font-medium text-black">Continue with Google</span>
        </button>

        <p className="text-sm text-black mb-6">
          new to Reo?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
=======
        <div className="flex items-center justify-center py-4">
          <span className="text-sm text-gray-500">Or</span>
        </div>

        <button className="w-full border border-gray-300 bg-white px-4 py-2 rounded-md shadow-sm flex items-center justify-center space-x-2">
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="w-5 h-5"
          />
          <span className="font-inter text-sm text-black">
            Continue with Google
          </span>
        </button>

        <p className="text-center text-sm font-inter">
          new to Reo?{" "}
          <Link to="#" className="text-blue-600 hover:underline">
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d
            Create Account
          </Link>
        </p>

<<<<<<< HEAD
        {/* Back & Login Buttons */}
        <div className="flex justify-between">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full bg-[#D9D9D9] text-black font-medium"
          >
            Back
          </button>
          <button
            onClick={handleLogin} // Trigger login process
            className="px-6 py-2 rounded-full bg-black text-white font-medium"
          >
=======
        <div className="flex justify-between mt-6">
          <Link
            to="/"
            className="px-6 py-2 rounded-full bg-[#D9D9D9] text-black font-outfit"
          >
            Back
          </Link>
          <button className="px-6 py-2 rounded-full bg-black text-white font-outfit">
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d
            Login
          </button>
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d

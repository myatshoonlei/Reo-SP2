import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "../assets/googleIcon.png";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/login`, {
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
        localStorage.setItem(
          "displayName",
          data.fullname || email.split("@")[0]
        );


        // Navigate to Home page
        navigate("/home", { replace: true });
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
        <div className="relative text-left mb-6">
          <label className="block text-sm font-semibold text-black mb-1">Password</label>
          <input
            // 2. Changed type based on `showPassword` state
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div
            className="absolute right-3 top-[70%] -translate-y-1/2 cursor-pointer text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>

          {/* <div className="text-right mt-1">
            <Link to="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div> */}
        </div>

        <div className="text-sm text-gray-500 mb-4">Or</div>
        {/* Google Button */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const cred = credentialResponse?.credential || "";
              const decoded = cred ? jwtDecode(cred) : null;
              if (!decoded) {
                alert("Google Sign-In failed. Try again.");
                return;
              }
              console.log("Google User:", decoded);

              const { name: fullName, email: userEmail, picture } = decoded;
              if (!userEmail) {
                alert("Google did not return an email for this account.");
                return;
              }



              try {
                const res = await fetch(`${API_URL}/api/google-auth`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ name: fullName, email: userEmail, picture }),

                });

                const data = await res.json();

                if (res.ok) {
                  localStorage.setItem("token", data.token);
                  localStorage.setItem(
                    "displayName",
                    data.name || fullName || userEmail?.split("@")[0]
                  );

                  alert(`Welcome ${data.name || fullName}!`);
                  navigate("/home", { replace: true }); // or /dashboard
                } else {
                  alert(data.error || "Something went wrong.");
                }
              } catch (err) {
                alert("Server error while saving Google user.");
              }
            }}
            onError={() => {
              alert("Google Sign-In failed");
            }}
          />
        </div>
        <p className="text-sm text-black mb-6">
          new to Reo?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create Account
          </Link>
        </p>

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
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

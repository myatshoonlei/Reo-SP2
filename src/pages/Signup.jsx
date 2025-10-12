import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import googleIcon from "../assets/googleIcon.png";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Eye, EyeOff } from "lucide-react";


export default function Signup() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // 👇 State for form inputs
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  const validateEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input) && input !== '') {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
    }
    setEmail(input);
  };

  const validateEmailFormat = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };



  // 👇 Function to handle form submission
  const handleSignup = async () => {
    if (!validateEmailFormat(email)) {
      setEmailError("Please input a valid email address.");
      return;
    }
    setEmailError("");

    if (password.length < 8) {
      return alert("Password must be at least 8 characters.");
    }
    try {
      const res = await fetch(`${API_URL}/api/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fullname: fullName, email, password }),
      });



      const data = await res.json();


      if (res.ok) {
        setEmailError(""); // clear any previous error
        localStorage.setItem("pendingEmail", email);
        navigate("/verify-email-sent", { state: { email } });
      } else {
        if (data.error?.toLowerCase().includes("email")) {
          setEmailError(data.error); // show inline email error
        } else {
          alert(data.error || "Something went wrong."); // fallback for other errors
        }
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
            onChange={(e) => {
              validateEmail(e.target.value);
              // clear error on change
            }}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${emailError ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"
              }`}
          />
          {emailError && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              {/* <svg
                className="h-4 w-4 text-red-500 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.366-.446.98-.446 1.346 0l6.518 7.938c.329.4.04.963-.447.963H2.59c-.487 0-.776-.563-.447-.963l6.114-7.938zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-2a1 1 0 01-1-1V7a1 1 0 012 0v3a1 1 0 01-1 1z"
                  clipRule="evenodd"
                />
              </svg> */}
              {emailError}
            </p>
          )}
        </div>


        {/* Password */}
        {/* Password */}
        <div className="relative text-left mb-6"> {/* <-- 1. Added 'relative' here */}
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
            className="absolute right-3 top-1/2 mt-3 transform -translate-y-1/2 cursor-pointer text-gray-500" // Adjusted positioning slightly
            onClick={() => setShowPassword(prev => !prev)} 
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </div>
        </div>

        {/* Divider */}
        <div className="text-sm text-gray-500 mb-4 text-center">Or</div>

        {/* Google Button */}
        <div className="flex justify-center mb-4">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
            const decoded = jwtDecode(credentialResponse.credential);
            console.log("Google User:", decoded); // check what's inside

            const { name, email, picture } = decoded;

            try {
              const res = await fetch(`${API_URL}/api/google-auth`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, picture }),
              });

              const data = await res.json();

              if (res.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                  "displayName",
                  data.name || fullName || email?.split("@")[0]
                );

                alert(`Welcome ${data.name || name}!`);
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
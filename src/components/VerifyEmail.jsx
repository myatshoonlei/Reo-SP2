import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

export default function VerifyEmail() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [searchParams] = useSearchParams();
  const shouldRedirect = searchParams.get("redirect") === "true";

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/verify-email/${token}`, {
          method: "GET",
        });

        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          
        } else {
          navigate("/signup");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC] px-4 font-inter">
      <div className="w-full max-w-sm text-center">
        {status === "verifying" && (
          <>
            <h1 className="text-3xl font-bold text-black-600 mb-6">Verifying...</h1>
            <p className="text-md text-gray">Please wait while we verify your email.</p>
          </>
        )}
        {status === "success" && (
          <>
            <h1 className="text-3xl font-bold text-black-600 mb-6">Your Email is Verified and Account Activated!</h1>
            <p className="text-md text-gray">
              You can now close this tab and return to the website to log in.
            </p>

          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-3xl font-bold text-black-600 mb-6">Verification Failed :(</h1>
            <p className="text-md text-gray">Please try again..</p>
          </>
        )}
      </div>
    </div>
  );
}

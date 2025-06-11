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
          />
          <div className="text-right mt-1">
            <Link to="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

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
            Create Account
          </Link>
        </p>

        <div className="flex justify-between mt-6">
          <Link
            to="/"
            className="px-6 py-2 rounded-full bg-[#D9D9D9] text-black font-outfit"
          >
            Back
          </Link>
          <button className="px-6 py-2 rounded-full bg-black text-white font-outfit">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

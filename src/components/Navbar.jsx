import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-[#E2EDF6] font-outfit px-8 md:px-16 py-4 shadow-lg flex justify-between items-center">
      <h1 className="text-2xl md:text-3xl font-semibold font-inter text-dark">
        Reo
      </h1>
      <Link
        to="/login"
        style={{ color: "white" }}
        className="bg-[#1E1E1E] font-outfit text-lg px-6 py-2 rounded-full shadow-md"
      >
        Log in/ Sign up
      </Link>
    </nav>
  );
}

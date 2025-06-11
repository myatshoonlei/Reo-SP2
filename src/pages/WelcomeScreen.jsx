import Navbar from "../components/Navbar";

export default function WelcomeScreen() {
  return (
    <div
      className="min-h-screen font-robot"
      style={{
        background: "linear-gradient(to bottom, #F3F9FE, #C5DBEC)",
      }}
    >
      <Navbar />
      <div className="flex flex-col justify-center items-center text-center text-dark p-8">
        <h2 className="text-4xl font-outfit font-bold mb-4">Your Ultimate Virtual Business Card</h2>
        <p className="font-inter text-base text-dark">Create and share beautiful digital business cards in seconds.</p>
      </div>
    </div>
  );
}

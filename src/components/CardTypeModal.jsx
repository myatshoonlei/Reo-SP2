import { useNavigate } from "react-router-dom";

const CardTypeModal = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate("/home");
  };

  const handleSelectMyself = () => {
    localStorage.removeItem("personal_card_id");
    navigate("/create/personal-info", { 
      state: { 
        cardType: "Myself",
        comingFromCardType: true 
      } 
    });
  };

  const handleSelectTeam = () => {
    localStorage.removeItem("team_card_id");
    navigate("/create/team-info", { 
      state: { 
        cardType: "Team",
        comingFromCardType: true 
      } 
    });
  };

  return (
    <div className="fixed inset-0 bg-gray bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Who is this card for?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={handleSelectMyself}
            className="border border-gray-300 rounded-lg p-4 text-center hover:bg-[#f0f8ff] hover:shadow-md cursor-pointer transition"
          >
            <p className="text-[#0b2447] font-semibold mb-2">Personal</p>
            <p className="text-sm text-gray-600">
              Create your own digital business card and start sharing instantly.
            </p>
          </div>

          <div
            onClick={handleSelectTeam}
            className="border border-gray-300 rounded-lg p-4 text-center hover:bg-[#f0f8ff] hover:shadow-md cursor-pointer transition"
          >
            <p className="text-[#0b2447] font-semibold mb-2">My Team</p>
            <p className="text-sm text-gray-600">
              Set up a network of digital business cards for your team to enhance connections.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardTypeModal;
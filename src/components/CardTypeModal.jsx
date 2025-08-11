const CardTypeModal = ({ onClose, onSelectTeam, onSelectMyself }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full">
        <h2 className="text-center text-xl font-bold mb-4 text-[#0b2447]">
          Who is this card for ?
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={onSelectMyself}
            className="border border-gray-300 rounded-lg p-4 text-center hover:bg-[#f0f8ff] hover:shadow-md cursor-pointer transition"
          >
            <p className="text-[#0b2447] font-semibold mb-2">Personal</p>
            <p className="text-sm text-gray-600">
              Create your own digital business card and start sharing instantly.
            </p>
          </div>

          <div
            onClick={onSelectTeam}
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
            onClick={onClose}
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

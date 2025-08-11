const TeamCompanyModal = ({ onClose, onNext }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[340px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 1</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-1">Company Name</h3>
        <p className="text-xs text-gray-500 mb-4">
          Create Business Cards for your team in seconds
        </p>
        <input
          type="text"
          placeholder="Enter Your Business Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <div className="flex justify-center gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={onNext}
            className="bg-blue-400 text-white px-6 py-2 rounded-md text-sm hover:bg-blue-500 transition"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeamCompanyModal;

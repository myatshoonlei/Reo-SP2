const UploadInfoModal = ({ onClose, onBack, onNext }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[360px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 5</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-2">
          Upload Information
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your team’s information in Excel or CSV format to quickly
          generate business cards for all members.
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#0b2447] mb-1">
              Download the sample CSV file to ensure your team’s details are
              correctly formatted.
            </p>
            <button className="border border-[#0b2447] text-[#0b2447] text-sm px-4 py-1.5 rounded-md hover:bg-[#f0f0f0]">
              ⬇ Download
            </button>
          </div>

          <div>
            <p className="text-xs text-[#0b2447] mb-1">
              Fill in the required fields and upload the completed file to
              generate business cards.
            </p>
            <button className="border border-blue-500 text-blue-500 text-sm px-4 py-1.5 rounded-md hover:bg-blue-50">
              📤 Upload Here
            </button>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={onBack}
            className="text-sm border px-4 py-2 rounded hover:bg-gray-100"
          >
            ← Previous
          </button>
          <button
            onClick={onNext}
            className="bg-blue-400 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-500"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadInfoModal;
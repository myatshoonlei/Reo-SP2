// UploadInfoModal.jsx
import { useState, useEffect } from "react";   // ✅ include useEffect
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const SAMPLE_XLSX_URL = "/employee-info-template.xlsx";
const uploadKey = (teamId) => `team_upload:${teamId}`;

export default function UploadInfoModal() {
  const navigate = useNavigate();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const {
    cardType,
    cardId,
    teamId: stateTeamId,
    companyName,
    croppedLogo,
    primaryColor,
    secondaryColor,
  } = location.state || {};

  const effectiveTeamId =
    stateTeamId ||
    (() => {
      const raw = localStorage.getItem("team_card_id");
      return raw && raw !== "null" && raw !== "undefined" ? Number(raw) : null;
    })();

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [savedUpload, setSavedUpload] = useState(null); // metadata only

  // Load previous upload metadata (if any)
  useEffect(() => {
    if (!effectiveTeamId) return;
    const raw = localStorage.getItem(uploadKey(effectiveTeamId));
    if (raw) {
      try {
        setSavedUpload(JSON.parse(raw));
      } catch {
        setSavedUpload(null);
      }
    }
  }, [effectiveTeamId]);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && !f.name.endsWith(".xlsx")) {
      setUploadError("Please select a valid Excel (.xlsx) file.");
      setFile(null);
    } else {
      setFile(f || null);
      setUploadError(null);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = SAMPLE_XLSX_URL;
    link.setAttribute("download", "employee-info-template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goBack = () => {
    navigate("/create/background-color", {
      state: {
        cardType,
        cardId,
        teamId: effectiveTeamId,
        croppedLogo,
        primaryColor,
        secondaryColor,
      },
    });
  };

  const goNext = () => {
    navigate("/create/template-selection", {
      state: {
        cardType: "Team",
        cardId,
        teamId: effectiveTeamId,
        companyName,
        croppedLogo,
        primaryColor,
        secondaryColor,
      },
    });
  };

  const handleFileUpload = async () => {
    if (!file) {
      setUploadError("Please select a file to upload.");
      return;
    }
    if (!effectiveTeamId) {
      setUploadError("Team ID is missing. Cannot upload info.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = async (e) => {
      try {
        if (typeof XLSX === "undefined") throw new Error("SheetJS library not loaded correctly.");
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Use formatted text; keep empty cells as ""
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });

        if (!rows || rows.length === 0) throw new Error("The uploaded file is empty or invalid.");

        // sanitize
        const clean = (v) => (v == null ? "" : String(v).replace(/^\s*'+/, "").trim());
        const cleaned = rows.map((r) => ({
          fullname: clean(r.fullname),
          jobTitle: clean(r.jobTitle || r.job_title),
          email: clean(r.email).toLowerCase(),
          phoneNumber: clean(r.phoneNumber || r.phone_number)
            .replace(/[^\d+()\-.\s]/g, "")
            .replace(/\s+/g, " ")
            .trim(),
          companyAddress: clean(r.companyAddress),
        }));

        const token = localStorage.getItem("token");
        await axios.post(
          `${API_BASE}/api/teamInfo`,
          { teamId: effectiveTeamId, members: cleaned },
          { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
        );

        // Save metadata so user can return without re-uploading
        const meta = { fileName: file.name, membersCount: cleaned.length, at: Date.now() };
        localStorage.setItem(uploadKey(effectiveTeamId), JSON.stringify(meta));
        setSavedUpload(meta);

        setIsUploading(false);
        goNext();
      } catch (err) {
        console.error("Upload error:", err?.response?.data || err.message);
        setUploadError("Failed to upload team data. Please check the file format and try again.");
        setIsUploading(false);
      }
    };

    reader.onerror = (err) => {
      console.error("File reading error:", err);
      setUploadError("Failed to read the selected file.");
      setIsUploading(false);
    };
  };

  const hasPreviousUpload = !!savedUpload;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[380px] text-center">
        <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 5</h2>
        <h3 className="text-lg font-bold text-[#0b2447] mb-2">Upload Information</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload your team’s information in Excel format to quickly generate cards.
        </p>

        {/* Show previous upload info (metadata) */}
        {hasPreviousUpload && (
          <div className="mb-4 text-xs text-gray-600 bg-gray-50 border rounded p-2 text-left">
            <div><span className="font-semibold">Last upload:</span> {savedUpload.fileName}</div>
            <div><span className="font-semibold">Members:</span> {savedUpload.membersCount}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#0b2447] mb-1">
              Download the sample Excel file to ensure your team’s details are formatted.
            </p>
            <button
              onClick={handleDownload}
              className="border border-[#0b2447] text-[#0b2447] text-sm px-4 py-1.5 rounded-md hover:bg-[#f0f0f0]"
            >
              ⬇ Download
            </button>
          </div>

          <div>
            <p className="text-xs text-[#0b2447] mb-1">Fill it in and upload the completed file.</p>
            <input id="file-upload" type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
            <label
              htmlFor="file-upload"
              className="border border-blue-500 text-blue-500 text-sm px-4 py-1.5 rounded-md hover:bg-blue-50 cursor-pointer"
            >
              📤 Upload Here
            </label>
            {file && <p className="mt-2 text-sm text-gray-600">Selected file: {file.name}</p>}
            {uploadError && <p className="mt-2 text-sm text-red-500">{uploadError}</p>}
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={goBack} className="text-sm border px-4 py-2 rounded hover:bg-gray-100">
            ← Previous
          </button>

          {/* If there is a previous successful upload, allow Next without selecting a new file */}
          <button
            onClick={file ? handleFileUpload : (hasPreviousUpload ? goNext : handleFileUpload)}
            disabled={isUploading || (!file && !hasPreviousUpload)}
            className={`px-4 py-2 text-sm rounded-md text-white ${
              isUploading || (!file && !hasPreviousUpload)
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-400 hover:bg-blue-500 cursor-pointer"
            }`}
          >
            {isUploading ? "Uploading..." : "Next →"}
          </button>
        </div>

        {hasPreviousUpload && !file && (
          <p className="mt-2 text-[11px] text-gray-500">
            Using previous upload (<em>{savedUpload.fileName}</em>). Uploading a new file will replace existing members.
          </p>
        )}
      </div>
    </div>
  );
}
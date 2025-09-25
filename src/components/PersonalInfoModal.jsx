import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import ReactSelect from "react-select";
import '../index.css';

const PersonalInfoModal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // API + auth
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Pull params from navigation
  const { cardType, comingFromCardType, editMode, cardData } = location.state || {};
  const stateCardId = location.state?.cardId ?? null;

  // Get stored ID more safely
  const getStoredId = () => {
    const stored = localStorage.getItem('personal_card_id');
    return stored && stored !== 'null' && stored !== 'undefined' ? Number(stored) : null;
  };

  const incomingId = stateCardId ?? cardData?.cardId ?? getStoredId();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [cardId, setCardId] = useState(incomingId);

  // Step 2 state
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const handleBack = () => {
    localStorage.removeItem("personal_card_id");
    setCardId(null);
    // Clear form data when going back to card type selection
    setFullname('');
    setEmail('');
    setCompanyName('');
    setJobTitle('');
    setPhoneNumber('');
    setCompanyAddress('');
    navigate("/create/card-type");
  };

  const handleNext = () => {
    navigate("/create/company-logo", {
      state: {
        cardType: "Myself",
        cardId: cardId
      }
    });
  };

  // Load existing card data
  const loadCardData = async (id) => {
    if (!id || !token) return;
    setLoading(true);
    try {
      console.log(`Loading card data for ID: ${id}`);
      const res = await fetch(`${API_BASE}/api/personal-card/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        if (res.status === 404) {
          console.log(`Card ${id} not found, clearing localStorage`);
          localStorage.removeItem('personal_card_id');
          setCardId(null);
          return;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const { data } = await res.json();
      console.log('Loaded card data:', data);

      // Update form fields
      setCardId(data.id);
      setFullname(data.fullname || '');
      setEmail(data.email || '');
      setCompanyName(data.companyName || '');
      setJobTitle(data.jobTitle || '');
      setPhoneNumber(data.phoneNumber || '');
      setCompanyAddress(data.companyAddress || '');
      // Ensure localStorage is in sync
      localStorage.setItem('personal_card_id', data.id.toString());
    } catch (error) {
      console.error('Failed to load card:', error);
      // Clear invalid ID from localStorage
      localStorage.removeItem('personal_card_id');
      setCardId(null);
    } finally {
      setLoading(false);
    }
  };

  // Initialize form data
  useEffect(() => {
    console.log('🎬 useEffect triggered with:', {
      comingFromCardType,
      editMode,
      incomingId,
      locationState: location.state
    });
    if (comingFromCardType) {
      // Starting fresh from card-type selection → clear everything
      console.log('🧹 Coming from card type selection - clearing form');
      setFullname('');
      setEmail('');
      setCompanyName('');
      setJobTitle('');
      setPhoneNumber('');
      setCompanyAddress('');
      setCardId(null);
      localStorage.removeItem('personal_card_id');
    } else if (editMode || incomingId) {
      // Edit mode or returning with an ID → load existing data
      console.log('📝 Loading existing card data, ID:', incomingId);
      loadCardData(incomingId);
    } else {
      // Check if there's a stored ID from previous session
      const storedId = getStoredId();
      console.log('💾 Checking stored ID:', storedId);
      if (storedId) {
        console.log('📂 Found stored ID, loading data:', storedId);
        setCardId(storedId);
        loadCardData(storedId);
      } else {
        console.log('🆕 No stored ID found, starting fresh');
      }
    }
  }, [editMode, incomingId, comingFromCardType, API_BASE, token]);

  const onCropComplete = useCallback((_, areaPixels) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const showCroppedImage = useCallback(async () => {
    try {
      const cropped = await getCroppedImg(imageSrc, croppedAreaPixels);
      setCroppedImage(cropped);
      setImageSrc(null);
    } catch (e) {
      console.error(e);
    }
  }, [imageSrc, croppedAreaPixels]);

  const uploadImageToServer = async () => {
    if (!croppedImage) return false;
    const res = await fetch(croppedImage);
    const blob = await res.blob();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("logo", blob);

    try {
      const uploadRes = await fetch("http://localhost:5000/api/upload-logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const result = await uploadRes.json();
      console.log("Uploaded successfully:", result);
      return true;
    } catch (error) {
      console.error("Upload failed:", error);
      return false;
    }
  };

  const jobTitles = [
    "Software Engineer", "Product Manager", "Designer", "Data Scientist",
    "Marketing Specialist", "Product Designer", "Web Developer", "Full Stack Developer",
    "Backend Developer", "Frontend Developer", "Machine Learning Engineer", "DevOps Engineer",
    "Business Analyst", "Project Manager", "Quality Assurance Engineer", "UI/UX Designer",
    "Data Analyst", "System Administrator", "Cloud Engineer", "Security Engineer",
    "Sales Engineer", "HR Manager", "Operations Manager", "Research Scientist",
    "Artificial Intelligence Engineer", "Blockchain Developer", "Data Architect",
    "Game Developer", "Network Engineer", "Mobile Developer", "Content Writer",
    "SEO Specialist", "Technical Support Specialist", "Database Administrator",
    "Cloud Solutions Architect", "Cybersecurity Analyst", "Account Manager", "Customer Success Manager",
    "Business Development Representative", "Marketing Manager", "Sales Manager",
    "Operations Specialist", "Product Marketing Manager", "Data Science Intern",
    "Compliance Officer", "Legal Counsel", "Healthcare Administrator", "Financial Analyst",
    "Financial Advisor", "Investment Banker", "Physician", "Nurse", "Pharmacist",
    "Architect", "Construction Manager", "Logistics Manager", "Supply Chain Manager",
    "Customer Support Specialist", "Research Assistant", "Brand Manager",
    "Public Relations Specialist", "Event Planner", "Social Media Manager", "Retail Manager",
    "Sales Associate", "Customer Service Representative", "Accountant", "Tax Advisor",
    "Payroll Specialist", "Healthcare Consultant", "Nursing Assistant", "Software Tester",
    "Digital Marketer", "Content Strategist", "Copywriter", "Operations Coordinator",
    "Executive Assistant", "Legal Assistant", "Paralegal", "Business Owner", "Entrepreneur",
    "Consultant", "Freelancer", "Product Owner", "Chief Executive Officer",
    "Chief Technology Officer", "Chief Marketing Officer", "Chief Financial Officer",
    "Chief Operating Officer", "Chief Information Officer", "Chief People Officer",
    "Chief Strategy Officer"
  ];

  const handleJobTitleChange = (selectedOption) => {
    setJobTitle(selectedOption ? selectedOption.value : "");
  };

  const validateEmail = (input) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input) && input !== '') {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError(null);
    }
    setEmail(input);
  };

  const handleSubmitStep1 = async () => {
  // Require all fields
  if (
    !fullname.trim() ||
    !email.trim() ||
    !companyName.trim() ||
    !jobTitle.trim() ||
    !phoneNumber.trim() ||
    !companyAddress.trim()
  ) {
    alert("Please fill in all fields.");
    return;
  }

  // Block on regex/format error
  if (emailError) return;
  if (submitting) return;

  setSubmitting(true);

  // Kickbox-style email verification
  try {
    const res = await fetch(`${API_BASE}/api/verify-email-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setEmailError(data.error || "Invalid email.");
      setSubmitting(false);
      return;
    }
  } catch (err) {
    console.error("Kickbox check failed:", err);
    alert("Server error during email verification.");
    setSubmitting(false);
    return;
  }

  // Auth check
  if (!token) {
    alert("User not logged in.");
    setSubmitting(false);
    return;
  }

  // Save card
  try {
    const storedId = localStorage.getItem("personal_card_id");
    const existingId = cardId ?? (storedId ? Number(storedId) : null);
    const isUpdate = cardId !== null;
    const method = isUpdate ? "PUT" : "POST";
    const url = isUpdate
      ? `${API_BASE}/api/personal-card/${existingId}`
      : `${API_BASE}/api/personal-card`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullname,
        email,
        companyName,
        jobTitle,
        phoneNumber,
        companyAddress,
      }),
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert("Server error: Invalid response");
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      alert(data.error || "Something went wrong.");
      setSubmitting(false);
      return;
    }

    const resultCardId = method === "POST" ? data?.data?.id : cardId;
    if (resultCardId == null) {
      alert("Could not get card ID from server.");
      setSubmitting(false);
      return;
    }

    setCardId(resultCardId);
    localStorage.setItem("personal_card_id", resultCardId.toString());

    // ✅ All good — now navigate
    navigate("/create/company-logo", {
      state: { cardType: "Myself", cardId: resultCardId },
    });
  } catch (err) {
    alert(`Server error: ${err.message}`);
    console.error("Submit error:", err);
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 bg-blue bg-opacity-60 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-[700px] w-full mx-4 max-h-[90vh] overflow-y-auto shadow-xl relative">

        {step === 1 && (
          <>
            <h2 className="font-semibold text-gray-600 text-sm mb-1 text-center">Step 1</h2>
            <h3 className="text-lg font-bold text-[#0b2447] mb-1 text-center">
              {cardId ? 'Edit Your Business Card' : 'Create Your Own Business Card'}
            </h3>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-left">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
                <input
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  type="text"
                  placeholder="Enter Your Full Name"
                  className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Organization Name</label>
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  type="text"
                  placeholder="Enter Your Organization Name"
                  className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Job Title</label>
                <ReactSelect
                  options={jobTitles.map((t) => ({ value: t, label: t }))}
                  onChange={handleJobTitleChange}
                  value={jobTitle ? { value: jobTitle, label: jobTitle } : null}
                  placeholder="Search for a job title..."
                  className="border rounded-md text-sm"
                  menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                  menuPosition="fixed"
                  menuShouldScrollIntoView={false}
                  closeMenuOnScroll={false}
                  maxMenuHeight={240}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({ ...base, zIndex: 9999 })
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  type="text"
                  placeholder="Enter Your Phone Number"
                  className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
                <input
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  type="email"
                  placeholder="Enter Your Email"
                  className={`w-full px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${emailError ? "border-red-500" : ""}`}
                />
                {emailError && (
                  <p className="text-xs text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Company Address</label>
                <input
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  type="text"
                  placeholder="Enter Your Address"
                  className="w-full px-3 py-2 border border-gray-400 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </form>

            <div className="flex justify-between mt-6">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700"
                disabled={submitting}
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitStep1}
                disabled={submitting || !!emailError}
                className={`px-4 py-2 text-sm rounded-md ${submitting || emailError
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-400 hover:bg-blue-500'
                  } text-white`}
              >
                {submitting ? 'Saving...' : 'Next →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PersonalInfoModal;
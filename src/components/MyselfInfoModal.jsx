import { useState, useRef, useCallback, useEffect } from "react"; // ✅ add useEffect
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import ReactSelect from "react-select"; // Import React Select
import '../index.css'; 

const MyselfInfoModal = ({
  onClose,
  onBack,
  onNext,
  fullname,
  setFullname,
  email,
  setEmail,
  companyName,
  setCompanyName,
  jobTitle,
  setJobTitle,
  phoneNumber,
  setPhoneNumber,
  companyAddress,
  setCompanyAddress,
  cardId,
  setCardId,
  resetForm,            // ✅ add this
  setResetForm 
}) => {

  const [step, setStep] = useState(1);

  // Step 1 state
  // const [companyName, setCompanyName] = useState('');
  // const [jobTitle, setJobTitle] = useState('');
  // const [phoneNumber, setPhoneNumber] = useState('');
  // const [companyAddress, setCompanyAddress] = useState('');
  // const [cardId, setCardId] = useState(null); // 🆕 track current card


  // Step 2 state
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
  // Only restore the cardId from localStorage if resetForm is NOT true
  if (!resetForm) {
    const savedId = localStorage.getItem("personal_card_id");
    if (savedId) {
      setCardId(Number(savedId));
    }
  }
}, [resetForm]);


useEffect(() => {
  if (resetForm) {
    setFullname('');
    setEmail('');
    setCompanyName('');
    setJobTitle('');
    setPhoneNumber('');
    setCompanyAddress('');
    setCardId(null);  // Clear the state cardId

    // Clear cardId from localStorage if needed
    localStorage.removeItem("personal_card_id");

    setResetForm(false);  // Clear the reset flag after resetting
  }
}, [resetForm]);




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
    setJobTitle(selectedOption ? selectedOption.value : "");  // Update job title state
  };

  const handleSubmitStep1 = async () => {
  if (
    !fullname.trim() ||
    !email.trim() ||
    !companyName.trim() ||
    !jobTitle.trim() ||
    !phoneNumber.trim() ||
    !companyAddress.trim()
  ) {
    return alert("Please fill in all fields.");
  }

  // 🆕 Add this email validation check
  // A simple regex to check for a basic email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return alert("Please enter a valid email address.");
  }

  if (submitting) return; // 🛑 Prevent double click
  setSubmitting(true);     // 🔒 Lock

  const token = localStorage.getItem("token");
  if (!token) {
    alert("User not logged in.");
    setSubmitting(false);
    return;
  }

  // 🔁 Recover cardId from localStorage if lost
  let finalCardId = cardId || Number(localStorage.getItem("personal_card_id"));

try {
  const method = finalCardId ? "PUT" : "POST";
  const url = finalCardId
    ? `http://localhost:5000/api/personal-card/${finalCardId}`
    : "http://localhost:5000/api/personal-card";

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
  console.log("✅ Server response:", text);

  let data;
  try {
    data = JSON.parse(text);
  } catch (parseErr) {
    alert("Server error: Invalid response");
    console.error("❌ Parse error:", parseErr.message);
    setSubmitting(false);
    return;
  }

  if (res.ok) {
    if (!finalCardId && data.data?.id) {
      setCardId(data.data.id);
      localStorage.setItem("personal_card_id", data.data.id);
    }
    onNext(); // ➡️ Go to Step 2
  } else {
    alert(data.error || "Something went wrong.");
  }

} catch (err) {
  alert(`Server error: ${err.message}`);
  console.error("❌ Submit error:", err.message);
} finally {
  setSubmitting(false);
}
};


  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-lg w-[700px] text-center">
        {step === 1 && (
          <>
            <h2 className="font-semibold text-gray-600 text-sm mb-1">Step 1</h2>
            <h3 className="text-lg font-bold text-[#0b2447] mb-1">Create Your Own Business Card</h3>

            <form className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 text-left">
  <div>
    <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name</label>
    <input
      value={fullname}
      onChange={(e) => setFullname(e.target.value)}
      type="text"
      placeholder="Enter Your Full Name"
      className="w-full px-3 py-2 border rounded-md text-sm"
    />
  </div>
  <div>
    <label className="text-sm font-semibold text-gray-700 block mb-1">Company Name</label>
    <input
      value={companyName}
      onChange={(e) => setCompanyName(e.target.value)}
      type="text"
      placeholder="Enter Your Business Name"
      className="w-full px-3 py-2 border rounded-md text-sm"
    />
  </div>

  <div>
              <label className="text-sm font-semibold text-gray-700 block mb-1">Job Title</label>
              <ReactSelect
                options={jobTitles.map((title) => ({ value: title, label: title }))}
                onChange={handleJobTitleChange}
                value={jobTitle ? { value: jobTitle, label: jobTitle } : null} // Set the selected value
                placeholder="Search for a job title..."
                className="border rounded-md text-sm"
              />
            </div>

  <div>
  <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
  <input
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}  // Remove non-numeric characters
    type="text"
    placeholder="Enter Your Phone Number"
    className="w-full px-3 py-2 border rounded-md text-sm"
  />
</div>


  <div className="sm:col-span-2">
    <label className="text-sm font-semibold text-gray-700 block mb-1">Email</label>
    <input
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      type="email"
      placeholder="Enter Your Email"
      className="w-full px-3 py-2 border rounded-md text-sm"
    />
  </div>
  <div className="sm:col-span-2">
    <label className="text-sm font-semibold text-gray-700 block mb-1">Company Address</label>
    <input
      value={companyAddress}
      onChange={(e) => setCompanyAddress(e.target.value)}
      type="text"
      placeholder="Enter Your Address"
      className="w-full px-3 py-2 border rounded-md text-sm"
    />
  </div>
</form>


            <div className="flex justify-between mt-6">
  <button
    onClick={onBack}
    className="px-4 py-2 text-sm rounded-md bg-gray-200 text-gray-700"
  >
    ← Back
  </button>
  <button
    onClick={handleSubmitStep1}
    className="px-4 py-2 text-sm rounded-md bg-blue-400 hover:bg-blue-500 text-white"
  >
    Next →
  </button>
</div>
          </>
        )}
      </div>
    </div>
  );
};

export default MyselfInfoModal;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CardTypeModal from "../components/CardTypeModal";
import MyselfInfoModal from "../components/MyselfInfoModal";
import TeamCompanyModal from "../components/TeamCompanyModal";
import CompanyLogoModal from "../components/CompanyLogoModal";
import PrimaryColorModal from "../components/PrimaryColorModal";
import BackgroundColorModal from "../components/BackgroundColorModal";
import UploadInfoModal from "../components/UploadInfoModal";
import TemplateSelectionPage from "../pages/TemplateSelectionPage";


export default function Home() {
  const navigate = useNavigate();
  const [showCardTypeModal, setShowCardTypeModal] = useState(false);
  const [showMyselfInfoModal, setShowMyselfInfoModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCompanyLogoModal, setShowCompanyLogoModal] = useState(false);
  const [showPrimaryColorModal, setShowPrimaryColorModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showBackgroundColorModal, setShowBackgroundColorModal] =
    useState(false);
  const [cardType, setCardType] = useState(null); // "Myself" or "Team"

  // State for MyselfInfoModal
  const [fullname, setFullname] = useState("");
const [email, setEmail] = useState("");
const [companyName, setCompanyName] = useState('');
const [jobTitle, setJobTitle] = useState('');
const [phoneNumber, setPhoneNumber] = useState('');
const [companyAddress, setCompanyAddress] = useState('');
const [cardId, setCardId] = useState(null); // Track database id
const [comingFromCardType, setComingFromCardType] = useState(false);

const [croppedLogo, setCroppedLogo] = useState(null); // 🆕 store uploaded logo

const [showTemplateSelectionModal, setShowTemplateSelectionModal] = useState(false);



    useEffect(() => {
    setShowCardTypeModal(false);
    }, []);

  return (
    <div className="min-h-screen font-inter bg-gradient-to-b from-[#F3F9FE] to-[#C5DBEC]">
      <Navbar />

      <div className="flex pt-24">
        {/* Sidebar */}
        <aside className="ml-6 w-1/5 bg-[#f0f8ff] p-4 flex flex-col items-center rounded-xl shadow-md">
          <ul className="w-full space-y-2">
            {["My Cards", "Contacts", "Support", "Settings"].map(
              (item, index) => (
                <li key={item}>
                  <button
                    className={`w-full text-left px-4 py-3 text-md rounded-lg ${
                      index === 0
                        ? "bg-white text-[#0b2447] font-semibold shadow"
                        : "text-[#0b2447] hover:bg-white hover:shadow"
                    }`}
                  >
                    {item}
                  </button>
                </li>
              )
            )}
          </ul>
        </aside>

        {/* Main content */}
        <main className="w-4/5 p-6">
          <h1 className="text-2xl font-bold text-[#0b2447] mb-6 flex items-center gap-2">
            My Cards
            <span className="text-xs bg-[#0b2447] text-white px-2 py-[2px] rounded-full">
              +
            </span>
          </h1>

          {/* Create Card (Button triggers modal) */}
          <button
            onClick={() => setShowCardTypeModal(true)}
            className="bg-[#d4eafd] w-64 h-40 rounded-xl shadow-md flex flex-col justify-center items-center mb-10 focus:outline-none"
          >
            <div className="bg-[#0b2447] w-10 h-10 flex items-center justify-center rounded-full text-white text-xl font-bold mb-2">
              +
            </div>
            <span className="text-lg font-semibold text-[#576cbc]">
              Create New Card
            </span>
          </button>

          {/* Tooltip bubble */}
          {/* <div className="relative w-72 p-4 bg-white border border-[#bcd5f3] rounded-lg text-sm text-[#3b82f6] shadow-md">
            <div className="absolute -top-5 left-8 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#bcd5f3]"></div>
            <p>
              <strong>Step 1</strong> 🛈
            </p>
            <p className="mt-1">
              Click on this and you're ready to create your new virtual business
              card.
            </p>
            <button className="text-xs text-white bg-[#3b82f6] px-3 py-[2px] rounded mt-2 float-right">
              Next →
            </button>
          </div> */}
        </main>
      </div>

      {/* Modals */}
      {showCardTypeModal && (
<CardTypeModal
  onClose={() => setShowCardTypeModal(false)}
  onSelectTeam={() => {
    setCardType("Team"); // ✅ set cardType
    setShowCardTypeModal(false);
    setShowTeamModal(true);
  }}
  onSelectMyself={async () => {
  setCardType("Myself");
  // 🔑 start clean: no old id
  localStorage.removeItem("personal_card_id");
  setCardId(null);

  setComingFromCardType(true);  // so fields clear
  setShowCardTypeModal(false);
  setShowMyselfInfoModal(true);
}}

/>
)}

      {showMyselfInfoModal && (
  <MyselfInfoModal
  fullname={fullname}
  setFullname={setFullname}
  email={email}
  setEmail={setEmail}
  companyName={companyName}
  setCompanyName={setCompanyName}
  jobTitle={jobTitle}
  setJobTitle={setJobTitle}
  phoneNumber={phoneNumber}
  setPhoneNumber={setPhoneNumber}
  companyAddress={companyAddress}
  setCompanyAddress={setCompanyAddress}
  cardId={cardId}
  setCardId={setCardId}
  onClose={() => setShowMyselfInfoModal(false)}
  // In Home.jsx, where you pass onBack to MyselfInfoModal
onBack={() => {
  localStorage.removeItem("personal_card_id"); // clear persisted id
  setCardId(null);                             // clear state id too
  setShowMyselfInfoModal(false);
  setShowCardTypeModal(true);
  setComingFromCardType(true);                 // ensures inputs are cleared
}}

  onNext={() => {
    setShowMyselfInfoModal(false);
    setShowCompanyLogoModal(true);
  }}
  resetForm={comingFromCardType}
  setResetForm={setComingFromCardType}
/>
)}


      {showTeamModal && (
        <TeamCompanyModal
          onClose={() => setShowTeamModal(false)}
          onNext={() => {
            setShowTeamModal(false);
            setShowCompanyLogoModal(true);
          }}
        />
      )}

      {showCompanyLogoModal && (
        <CompanyLogoModal
  onClose={() => setShowCompanyLogoModal(false)}
  onBack={() => {
    if (cardType === "Myself") {
      setShowCompanyLogoModal(false);
      setShowMyselfInfoModal(true);
    } else {
      setShowCompanyLogoModal(false);
      setShowTeamModal(true);
    }
  }}
  onNext={() => {
    setShowCompanyLogoModal(false);
    setShowPrimaryColorModal(true);
  }}
  croppedLogo={croppedLogo}            // 🆕
  setCroppedLogo={setCroppedLogo}      // 🆕
  cardType={cardType}
/>
      )}

{showPrimaryColorModal && (
        <PrimaryColorModal
          onBack={() => {
            setShowPrimaryColorModal(false);
            setShowCompanyLogoModal(true);
          }}
          onNext={() => {
            setShowPrimaryColorModal(false);
            setShowBackgroundColorModal(true); // 👈 Go to Step 4
          }}
          cardId={cardId}
        />
      )}

      {showBackgroundColorModal && (
  <BackgroundColorModal
    onBack={() => {
      setShowBackgroundColorModal(false);
      setShowPrimaryColorModal(true);
    }}
    cardId={cardId}
    cardType={cardType}
    setShowBackgroundColorModal={setShowBackgroundColorModal}
    setShowUploadModal={setShowUploadModal}
    setShowTemplateSelectionModal={setShowTemplateSelectionModal} // ✅ add this
  />
)}


{showTemplateSelectionModal && (
  <TemplateSelectionPage
    onBack={() => {
      setShowTemplateSelectionModal(false);
      setShowBackgroundColorModal(true);
    }}
  />
)}


      {showUploadModal && (
        <UploadInfoModal
          onClose={() => setShowUploadModal(false)}
          onBack={() => {
            setShowUploadModal(false);
            setShowPrimaryColorModal(true); // Back to Step 4
          }}
          onNext={() => {
            setShowUploadModal(false);
            alert("Done! 🎉 ");
          }}
        />
      )}
    </div>
  );
}

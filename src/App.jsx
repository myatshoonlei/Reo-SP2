import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import VerifyEmail from "./components/VerifyEmail";
import VerifyEmailSent from "./components/verifyEmailSent";
import CardTypeModal from "./components/CardTypeModal";
import PersonalInfoModal from "./components/PersonalInfoModal";
import TeamCompanyModal from "./components/TeamCompanyModal";
import CompanyLogoModal from "./components/CompanyLogoModal";
import PrimaryColorModal from "./components/PrimaryColorModal";
import BackgroundColorModal from "./components/BackgroundColorModal";
import UploadInfoModal from "./components/UploadInfoModal";
import TemplateSelectionModal from "./components/TemplateSelectionModal";
import PreviewModal from "./components/PreviewModal";
import BusinessCardPage from "./pages/BusinessCardPage";
import QRCodeGenerator from "./components/QRCodeGenerator";
import EditCardPage from "./pages/EditCardPage";
import ContactsPage from "./pages/ContactsPage";
import TeamMembersPage from "./pages/TeamMembersPage";
import EditMyLinks from "./pages/EditMyLinks";
import EditContactSide from "./pages/EditContactSide";

// Component to handle body scroll lock
function ScrollController() {
  const location = useLocation();
  
  useEffect(() => {
    // Check if current route is a modal route
    const isModalRoute = location.pathname.startsWith('/create/');
    
    if (isModalRoute) {
      // Lock body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift from scrollbar
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [location.pathname]);

  return null;
}

function AppContent() {
  const location = useLocation();
  const isModalRoute = location.pathname.startsWith('/create/');
  
  return (
    <>
      <ScrollController />
      
      {/* Main Routes */}
      <div className={isModalRoute ? 'blur-sm' : ''}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/teams/:teamId" element={<TeamMembersPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/edit/mylinks/:cardId" element={<EditMyLinks />} />
          <Route path="/edit/contact/:cardId" element={<EditContactSide />} />

          <Route path="/card/:id" element={<BusinessCardPage key={location.pathname} />} />
          <Route path="/team/:teamId/member/:memberId" element={<BusinessCardPage key={location.pathname} />} />
          <Route path="/qr-code-generator" element={<QRCodeGenerator />} />

          {/* ✅ NEW: edit is a normal page route */}
          <Route path="/edit/about/:cardId" element={<EditCardPage />} />
          
          {/* Modal Routes - but they render over home */}
          <Route path="/create/*" element={<Home />} />
        </Routes>
      </div>
      
      {/* Modal Overlays - only render when on modal routes */}
      {isModalRoute && (
        <Routes>
          <Route path="/create/card-type" element={<CardTypeModal />} />
          <Route path="/create/personal-info" element={<PersonalInfoModal />} />
          <Route path="/create/team-info" element={<TeamCompanyModal />} />
          <Route path="/create/company-logo" element={<CompanyLogoModal />} />
          <Route path="/create/primary-color" element={<PrimaryColorModal />} />
          <Route path="/create/background-color" element={<BackgroundColorModal />} />
          <Route path="/create/upload-info" element={<UploadInfoModal />} />
          <Route path="/create/template-selection" element={<TemplateSelectionModal />} />
          <Route path="/create/preview" element={<PreviewModal />} />
        </Routes>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
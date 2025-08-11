import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import TemplateSelectionPage from "./pages/TemplateSelectionPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/template-selection" element={<TemplateSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
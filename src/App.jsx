import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import Login from "./pages/Login";
<<<<<<< HEAD
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import TemplateSelectionPage from "./pages/TemplateSelectionPage";
=======
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
<<<<<<< HEAD
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/template-selection" element={<TemplateSelectionPage />} />
=======
>>>>>>> e5875884714e99cadbd0c233c6947c4f77e7a52d
      </Routes>
    </Router>
  );
}

export default App;
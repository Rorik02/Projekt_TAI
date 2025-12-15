import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

// --- Twoje strony ---
import HomePage from "./pages/HomePage";       
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AppPage from "./pages/AppPage";
import RestaurantsHome from "./pages/RestaurantsHome";

import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerLogin from "./pages/OwnerLogin";
import CuisinesPage from "./pages/CuisinesPage";
import ContactPage from "./pages/ContactPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-white dark:bg-gray-900">
        
        <Routes>
          {/* --- Ścieżki Publiczne (Twoje) --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Dodajemy Navbar tylko do tych stron, używając Fragmentu <> */}
          <Route path="/restaurants" element={<><Navbar /><RestaurantsHome /></>} />
          <Route path="/cuisines" element={<><Navbar /><CuisinesPage /></>} />
          <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
          
          {/* --- Panel Właściciela --- */}
          <Route path="/dashboard" element={<><Navbar /><OwnerDashboard/></>} />
          
          {/* Placeholder */}
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
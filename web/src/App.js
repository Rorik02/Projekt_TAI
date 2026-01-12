import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

// --- Twoje strony ---
import HomePage from "./pages/HomePage";       
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AppPage from "./pages/AppPage";
// import RestaurantsHome from "./pages/RestaurantsHome"; // To jest stare, nie używamy
import CuisinesPage from "./pages/CuisinesPage";
import ContactPage from "./pages/ContactPage";

// --- Panele ---
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard"; 
import AdminUsers from "./pages/AdminUsers";
import AdminApplications from "./pages/AdminApplications";
import AdminRestaurants from "./pages/AdminRestaurants";
import RestaurantsPage from './pages/RestaurantsPage'; // <--- TWÓJ NOWY PLIK Z ADRESAMI

// --- OCHRONIARZ ---
const AdminGuard = ({ children }) => {
  const userRole = localStorage.getItem("user_role");
  const normalizedRole = userRole ? userRole.trim().toLowerCase() : "";

  if (normalizedRole === "admin") {
    return children;
  } else {
    return <Navigate to="/" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <div className="App min-h-screen bg-white dark:bg-gray-900">
        
        <Routes>
          {/* --- Ścieżki Publiczne --- */}
          
          {/* WAŻNA ZMIANA: Główna ścieżka prowadzi teraz do RestaurantsPage (z Navbarem) */}
          <Route path="/" element={<><Navbar /><RestaurantsPage /></>} />
          
          {/* Ścieżka /restaurants też prowadzi do nowej strony */}
          <Route path="/restaurants" element={<><Navbar /><RestaurantsPage /></>} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Pozostałe strony */}
          <Route path="/cuisines" element={<><Navbar /><CuisinesPage /></>} />
          <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
          
          {/* --- Panel Właściciela --- */}
          <Route path="/dashboard" element={<><Navbar /><OwnerDashboard/></>} />
          
          {/* --- PANEL ADMINISTRATORA --- */}
          <Route 
            path="/admin" 
            element={
              <AdminGuard>
                <>
                  <Navbar />
                  <AdminDashboard />
                </>
              </AdminGuard>
            } 
          />

          <Route 
            path="/admin/users" 
            element={
              <AdminGuard>
                <>
                  <Navbar />
                  <AdminUsers />
                </>
              </AdminGuard>
            } 
          />

          <Route 
            path="/admin/applications" 
            element={
              <AdminGuard>
                <>
                  <Navbar />
                  <AdminApplications />
                </>
              </AdminGuard>
            } 
          />

          <Route 
            path="/admin/restaurants" 
            element={
              <AdminGuard>
                <>
                  <Navbar />
                  <AdminRestaurants />
                </>
              </AdminGuard>
            } 
          />
          
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
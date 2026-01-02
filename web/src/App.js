import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";

// --- Twoje strony ---
import HomePage from "./pages/HomePage";       
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AppPage from "./pages/AppPage";
import RestaurantsHome from "./pages/RestaurantsHome";
import CuisinesPage from "./pages/CuisinesPage";
import ContactPage from "./pages/ContactPage";

// --- Panele ---
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard"; 
import AdminUsers from "./pages/AdminUsers";
import AdminApplications from "./pages/AdminApplications";
import AdminRestaurants from "./pages/AdminRestaurants"; // <--- NOWY IMPORT

// --- OCHRONIARZ (Komponent zabezpieczający) ---
// Sprawdza, czy użytkownik ma rolę "admin". Jeśli nie -> wyrzuca na stronę główną.
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
          {/* --- Ścieżki Publiczne  --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Strony z Navbarem */}
          <Route path="/restaurants" element={<><Navbar /><RestaurantsHome /></>} />
          <Route path="/cuisines" element={<><Navbar /><CuisinesPage /></>} />
          <Route path="/contact" element={<><Navbar /><ContactPage /></>} />
          
          {/* --- Panel Właściciela --- */}
          <Route path="/dashboard" element={<><Navbar /><OwnerDashboard/></>} />
          
          {/* --- PANEL ADMINISTRATORA (ZABEZPIECZONY) --- */}
          
          {/* 1. GŁÓWNY DASHBOARD (Kafelki) */}
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

          {/* 2. ZARZĄDZANIE UŻYTKOWNIKAMI */}
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

          {/* 3. WNIOSKI O RESTAURACJE */}
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

          {/* 4. ZARZĄDZANIE RESTAURACJAMI (Nowa trasa) */}
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
          
          {/* Placeholder */}
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
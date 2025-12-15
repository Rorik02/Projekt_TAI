import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  // Pobieramy dane
  const userName = localStorage.getItem("user_name");
  const userLastName = localStorage.getItem("user_last_name");
  const userRole = localStorage.getItem("user_role"); // Pobieramy surową rolę z bazy
  
  const isLoggedIn = !!userName;

  // SPRAWDZANIE ROLI (Ulepszone)
  // Zamieniamy na małe litery i usuwamy spacje, żeby mieć pewność
  const normalizedRole = userRole ? userRole.trim().toLowerCase() : "";
  const isOwner = normalizedRole === "właściciel" || normalizedRole === "owner";

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const getInitials = (name, lastName) => {
    const firstInitial = name ? name.charAt(0) : "";
    const lastInitial = lastName ? lastName.charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="bg-purple-600 dark:bg-purple-900 text-white shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
               <div className="w-8 h-8 bg-white text-purple-600 rounded-full flex items-center justify-center font-bold text-xl group-hover:rotate-12 transition">F</div>
               <span className="text-2xl font-bold tracking-wider hover:text-gray-200 transition">FoodAPP</span>
            </Link>
          </div>

          {/* Linki Główne */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/restaurants" className="hover:text-purple-200 font-medium transition">
              Restauracje
            </Link>
            <Link to="/cuisines" className="hover:text-purple-200 font-medium transition">
              Kuchnie
            </Link>
            
            {/* OPCJA DLA WŁAŚCICIELA (Widoczna na głównym pasku) */}
            {isLoggedIn && isOwner && (
                <Link 
                  to="/dashboard" 
                  className="bg-purple-700 hover:bg-purple-500 text-white px-3 py-2 rounded-md font-medium transition shadow-sm border border-purple-500"
                >
                  Moje Restauracje
                </Link>
            )}

            {/* SEKCJA UŻYTKOWNIKA (Prawa strona) */}
            {isLoggedIn ? (
              <div className="flex items-center gap-4 ml-4 pl-6 border-l border-purple-400">
                
                {/* Avatar (Inicjały) */}
                <div className="relative group cursor-default">
                  <div className="w-12 h-12 rounded-full bg-white text-purple-700 flex items-center justify-center font-bold text-lg shadow-lg border-2 border-purple-300">
                    {getInitials(userName, userLastName)}
                  </div>
                </div>

                {/* Tekst: Rola + Wyloguj */}
                <div className="flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-widest text-purple-200 font-semibold mb-1">
                    {userRole || "Użytkownik"}
                  </span>
                  
                  <button 
                    onClick={handleLogout}
                    className="text-sm text-left font-bold text-white hover:text-red-200 transition flex items-center gap-1"
                  >
                    Wyloguj
                  </button>
                </div>

              </div>
            ) : (
              /* Stan wylogowany */
              <div className="flex items-center gap-3 ml-4">
                <Link to="/login" className="px-4 py-2 rounded-lg hover:bg-purple-500 transition border border-transparent hover:border-purple-300">
                  Zaloguj
                </Link>
                <Link to="/register" className="px-4 py-2 bg-white text-purple-700 rounded-lg font-bold hover:bg-gray-100 transition shadow">
                  Rejestracja
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
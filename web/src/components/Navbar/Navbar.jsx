import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const [user, setUser] = useState(null);

  // Funkcja wylogowania
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");
    navigate("/login");
  };

  // POBIERANIE DANYCH UŻYTKOWNIKA - TO JEST KLUCZOWE
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://127.0.0.1:8000/users/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          // Opcjonalnie: aktualizuj rolę w localStorage dla pewności
          if (data.role) localStorage.setItem("user_role", data.role);
        } else {
          // Jeśli token jest nieważny -> wyloguj
          handleLogout();
        }
      } catch (error) {
        console.error("Błąd pobierania danych usera", error);
      }
    };

    fetchUser();
  }, [token]);

  return (
    <nav className="bg-purple-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LEWA STRONA: LOGO + LINKI */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 font-bold text-2xl tracking-wider">
              FoodAPP 🍔
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link to="/restaurants" className="hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition">
                  Restauracje
                </Link>
                <Link to="/cuisines" className="hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium transition">
                  Kuchnie
                </Link>
                
                {/* Link widoczny TYLKO dla Admina */}
                {user && user.role === 'admin' && (
                  <Link to="/admin" className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium transition shadow">
                    Administracja
                  </Link>
                )}
                
                {/* Link widoczny TYLKO dla Właściciela */}
                {user && user.role === 'właściciel' && (
                   <Link to="/dashboard" className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium transition shadow">
                   Panel Właściciela
                 </Link>
                )}
              </div>
            </div>
          </div>

          {/* PRAWA STRONA: PROFIL + WYLOGUJ */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col text-right mr-2">
                    <span className="text-sm font-bold uppercase tracking-wide">
                      {user.first_name || "Admin"} {user.last_name}
                    </span>
                    <button 
                        onClick={handleLogout} 
                        className="text-xs text-purple-200 hover:text-white text-right font-medium"
                    >
                        Wyloguj
                    </button>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white text-purple-800 flex items-center justify-center font-bold text-lg border-2 border-purple-300">
                    {user.first_name ? user.first_name[0].toUpperCase() : "A"}
                    {user.last_name ? user.last_name[0].toUpperCase() : ""}
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                    <Link to="/login" className="bg-purple-700 hover:bg-purple-600 px-4 py-2 rounded text-sm font-bold transition">
                        Zaloguj
                    </Link>
                    <Link to="/register" className="bg-white text-purple-800 hover:bg-gray-100 px-4 py-2 rounded text-sm font-bold transition">
                        Rejestracja
                    </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
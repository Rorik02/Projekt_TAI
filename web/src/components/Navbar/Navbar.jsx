import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Usuwamy import './Navbar.css', bo używamy Tailwinda

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("owner_username"); // Sprawdzamy czy ktoś jest zalogowany (wg logiki kolegi)

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="bg-purple-600 dark:bg-purple-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Nazwa */}
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-wider hover:text-gray-200 transition">
              FoodAPP
            </Link>
          </div>

          {/* Linki */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/restaurants" className="hover:bg-purple-500 px-3 py-2 rounded-md text-sm font-medium transition">
                Restauracje
              </Link>
              <Link to="/cuisines" className="hover:bg-purple-500 px-3 py-2 rounded-md text-sm font-medium transition">
                Kuchnie
              </Link>
              
              {token ? (
                <>
                  <Link to="/dashboard" className="bg-purple-700 hover:bg-purple-600 px-3 py-2 rounded-md text-sm font-medium transition shadow">
                    Panel Właściciela
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="hover:bg-red-500 px-3 py-2 rounded-md text-sm font-medium transition"
                  >
                    Wyloguj
                  </button>
                </>
              ) : (
                <Link to="/owner-login" className="hover:bg-purple-500 px-3 py-2 rounded-md text-sm font-medium transition">
                  Strefa Partnera
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
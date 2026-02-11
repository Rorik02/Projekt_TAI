import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setUser);
  }, [token]);

  const requestOwner = async () => {
    const res = await fetch("http://127.0.0.1:8000/users/request-owner", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message);
    window.location.reload();
  };

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">👤 Mój Profil</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 space-y-3 text-gray-700 dark:text-gray-300">
        <p><b className="text-gray-900 dark:text-white">Email:</b> {user.email}</p>
        <p><b className="text-gray-900 dark:text-white">Imię:</b> {user.first_name} {user.last_name}</p>
        <p><b className="text-gray-900 dark:text-white">Rola:</b> {user.role}</p>
      </div>

      {user.role === "user" && (
        <div className="mt-6">
          {user.role_request === "pending" ? (
            <p className="text-yellow-700 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700/50 px-4 py-3 rounded-lg font-bold inline-block">
              ⏳ Twój wniosek oczekuje na rozpatrzenie
            </p>
          ) : (
            <button
              onClick={requestOwner}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition transform hover:-translate-y-0.5"
            >
              🍽️ Złóż wniosek o restauratora
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Profile;
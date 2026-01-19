import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminApplications = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  // Zakładki: 'new' (oczekujące) | 'history' (historia) 'owners' 

  const [activeTab, setActiveTab] = useState("new");

  const [applications, setApplications] = useState([]);
  const [ownerRequests, setOwnerRequests] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- STANY MODALA ODRZUCENIA ---
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // 1. Pobieranie nowych wniosków
  const fetchNewApplications = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/restaurants/applications', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Błąd pobierania");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Pobieranie historii
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/restaurants/applications/history', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("Błąd pobierania historii");
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "new") fetchNewApplications();
    else if (activeTab === "owners") fetchOwnerRequests();
    else fetchHistory();
  }, [activeTab]);

  // --- AKCJE ---
  const handleApprove = async (restaurantId) => {
      if (!window.confirm(`Zatwierdzić wniosek #${restaurantId}?`)) return;
      await sendStatusUpdate(restaurantId, "approved", null);
  };

  const openRejectModal = (restaurantId) => {
      setRejectingId(restaurantId);
      setRejectionReason("");
      setIsRejectModalOpen(true);
  };

  const submitRejection = async () => {
      if (!rejectionReason.trim()) {
          alert("Podaj powód odrzucenia!");
          return;
      }
      await sendStatusUpdate(rejectingId, "rejected", rejectionReason);
      setIsRejectModalOpen(false);
  };

  const sendStatusUpdate = async (id, status, reason) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/restaurants/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                status: status,
                rejection_reason: reason 
            })
        });

        if (response.ok) {
            if (activeTab === "new") {
                setApplications(applications.filter(app => app.id !== id));
            } else {
                fetchHistory();
            }
            alert(`Pomyślnie zmieniono status wniosku #${id} na: ${status === 'approved' ? 'ZATWIERDZONY' : 'ODRZUCONY'}`);
        } else {
            alert("Błąd API.");
        }
    } catch (err) {
        console.error(err);
        alert("Błąd połączenia.");
    }
  };

  const fetchOwnerRequests = async () => {
  setLoading(true);
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/users/owner-requests",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!response.ok) throw new Error("Błąd pobierania");
    const data = await response.json();
    setOwnerRequests(data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const decideOwner = async (userId, approve) => {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/users/${userId}/owner-decision?approve=${approve}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Błąd decyzji");

    setOwnerRequests(ownerRequests.filter(u => u.id !== userId));
    alert(
      approve
        ? "Użytkownik został restauratorem"
        : "Wniosek został odrzucony"
    );
  } catch (err) {
    console.error(err);
    alert("Błąd API");
  }
};


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* NAGŁÓWEK */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Centrum Wniosków</h1>
            <button onClick={() => navigate('/admin')} className="bg-gray-800 hover:bg-gray-700 text-white px-5 py-2 rounded-lg border border-gray-600 transition">
                &larr; Wróć do Panelu
            </button>
        </div>

        {/* ZAKŁADKI */}
        <div className="flex space-x-4 mb-8 border-b border-gray-700">
            <button 
                onClick={() => setActiveTab("new")}
                className={`pb-3 px-4 text-lg font-medium transition-colors relative ${
                    activeTab === "new" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"
                }`}
            >
                Restauracja Wnioski
            </button>
            <button 
                onClick={() => setActiveTab("history")}
                className={`pb-3 px-4 text-lg font-medium transition-colors relative ${
                    activeTab === "history" ? "text-purple-400 border-b-2 border-purple-400" : "text-gray-400 hover:text-white"
                }`}
            >
                Historia Decyzji
            </button>
            <button 
              onClick={() => setActiveTab("owners")}
              className={`pb-3 px-4 text-lg font-medium transition-colors relative ${
                activeTab === "owners"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-400 hover:text-white"
              }`}
            >
                Restaurator wnioski
            </button>

        </div>

        {/* --- TABELA: NOWE WNIOSKI --- */}
        {activeTab === "new" && (
            <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                {applications.length === 0 && !loading ? (
                    <div className="p-10 text-center text-gray-400 flex flex-col items-center">
                        <span className="text-5xl mb-4">✅</span>
                        <h3 className="text-xl font-bold text-white">Brak nowych wniosków</h3>
                        <p>Wszystko na bieżąco!</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    {/* --- KOLUMNA ID --- */}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase w-20">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Lokal</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Typ</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Wnioskodawca</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Decyzja</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {applications.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-700/50 transition">
                                        {/* --- WARTOŚĆ ID --- */}
                                        <td className="px-6 py-4 text-gray-400 font-mono">#{app.id}</td>
                                        
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-lg">{app.name}</div>
                                            <div className="text-sm text-gray-400">{app.city}, {app.street}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900/30 text-blue-200 border border-blue-800">
                                                {app.cuisines}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {app.owner ? (
                                                <div>
                                                    <div className="text-white">{app.owner.first_name} {app.owner.last_name}</div>
                                                    <div className="text-xs text-gray-500">{app.owner.email}</div>
                                                </div>
                                            ) : <span className="text-red-500">Brak danych</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-3">
                                            <button onClick={() => openRejectModal(app.id)} className="px-3 py-1 bg-red-900/20 text-red-400 border border-red-800 rounded hover:bg-red-900/50 font-bold">Odrzuć</button>
                                            <button onClick={() => handleApprove(app.id)} className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-800 rounded hover:bg-green-900/50 font-bold">Zatwierdź</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        )}

        {activeTab === "owners" && (
  <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
    {ownerRequests.length === 0 && !loading ? (
      <div className="p-10 text-center text-gray-400">
        Brak wniosków o restauratora
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Użytkownik</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase">Decyzja</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {ownerRequests.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700/50 transition">
                <td className="px-6 py-4 text-gray-400 font-mono">
                  #{user.id}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-white">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-3">
                  <button
                    onClick={() => decideOwner(user.id, false)}
                    className="px-3 py-1 bg-red-900/20 text-red-400 border border-red-800 rounded hover:bg-red-900/50 font-bold"
                  >
                    Odrzuć
                  </button>
                  <button
                    onClick={() => decideOwner(user.id, true)}
                    className="px-3 py-1 bg-green-900/20 text-green-400 border border-green-800 rounded hover:bg-green-900/50 font-bold"
                  >
                    Zatwierdź
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
)}


        {/* --- TABELA: HISTORIA --- */}
        {activeTab === "history" && (
             <div className="bg-gray-800 rounded-xl shadow-xl overflow-hidden border border-gray-700">
                 {history.length === 0 && !loading ? (
                     <div className="p-10 text-center text-gray-400">Pusta historia.</div>
                 ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    {/* --- KOLUMNA ID --- */}
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase w-20">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Lokal</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Wnioskodawca</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase">Uwagi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {history.map((app) => (
                                    <tr key={app.id} className="hover:bg-gray-700/50 transition">
                                        {/* --- WARTOŚĆ ID --- */}
                                        <td className="px-6 py-4 text-gray-400 font-mono">#{app.id}</td>

                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white">{app.name}</div>
                                            <div className="text-xs text-gray-400">{app.city}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            {app.owner?.email}
                                        </td>
                                        <td className="px-6 py-4">
                                            {app.status === 'approved' ? (
                                                <span className="px-2 py-1 text-xs font-bold rounded bg-green-900/50 text-green-300 border border-green-700">ZATWIERDZONY</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-bold rounded bg-red-900/50 text-red-300 border border-red-700">ODRZUCONY</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400 italic">
                                            {app.status === 'rejected' ? (
                                                <span className="text-red-300">"{app.rejection_reason || "Brak powodu"}"</span>
                                            ) : (
                                                <span className="text-green-800">OK</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 )}
             </div>
        )}

        {/* --- MODAL ODRZUCENIA --- */}
        {isRejectModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
                <div className="bg-gray-800 rounded-xl shadow-2xl border border-gray-600 w-full max-w-md p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Powód odrzucenia wniosku #{rejectingId}</h3>
                    <p className="text-gray-400 text-sm mb-4">
                        Wpisz powód, dla którego odrzucasz ten wniosek. Właściciel zobaczy tę wiadomość w swoim panelu.
                    </p>
                    <textarea 
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded text-white focus:border-red-500 outline-none h-32 resize-none"
                        placeholder="Np. Błędny adres, brak menu, nieodpowiednia nazwa..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end gap-3 mt-4">
                        <button onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600">Anuluj</button>
                        <button onClick={submitRejection} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold">Zatwierdź Odrzucenie</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminApplications;
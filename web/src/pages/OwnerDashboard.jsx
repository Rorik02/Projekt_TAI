import React, { useState, useEffect } from "react";
import Modal from "../components/Modal/Modal";
import { useNavigate } from "react-router-dom";

// Kategorie kuchni
const RESTAURANT_CATEGORIES = [
  "Italian", "Japanese", "American", "Chinese", "Mexican",
  "Indian", "French", "Mediterranean", "Thai", "Fast Food", "Vegetarian", "Polish", "Burger", "Pizza", "Sushi"
];

// Kategorie menu
const MENU_CATEGORIES = [
    "Przystawka", 
    "Zupa", 
    "Danie główne", 
    "Dodatek", 
    "Deser", 
    "Napój"
];

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const userRole = localStorage.getItem("user_role");
  
  const normalizedRole = userRole ? userRole.trim().toLowerCase() : "";
  const hasAccess = normalizedRole === "właściciel" || normalizedRole === "owner" || normalizedRole === "admin";

  // --- STANY ---
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Stany Modali
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  // Formularz Tworzenia (Nowy wniosek)
  const [restForm, setRestForm] = useState({ 
      name: "", 
      category: RESTAURANT_CATEGORIES[0], 
      city: "", 
      street: "", 
      number: "", 
      rating: 5.0 
  });

  // Formularz Edycji (Poprawa odrzuconego wniosku)
  const [editForm, setEditForm] = useState(null);
  
  // Formularz Produktu
  const [prodForm, setProdForm] = useState({ 
      name: "", 
      price: "", 
      category: MENU_CATEGORIES[2] 
  });

  // --- ŁADOWANIE DANYCH ---
  useEffect(() => {
    if (hasAccess) loadRestaurants();
  }, [hasAccess]);

  const loadRestaurants = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/mine`, {
          headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);

    // Jeśli odrzucona -> Wypełnij formularz edycji danymi restauracji
    if (restaurant.status === 'rejected') {
        setEditForm({
            name: restaurant.name,
            category: restaurant.cuisines,
            city: restaurant.city,
            street: restaurant.street,
            number: restaurant.number
        });
        setProducts([]); // Nie ładujemy produktów dla odrzuconej
        return;
    }

    // Jeśli nie odrzucona -> Ładuj produkty (Menu)
    setLoadingProducts(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/${restaurant.id}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // --- AKCJE ---

  // 1. Wysyłanie nowego wniosku
  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            name: restForm.name,
            rating: restForm.rating,
            cuisines: restForm.category, 
            city: restForm.city,
            street: restForm.street,
            number: restForm.number
        };
        
        const res = await fetch("http://127.0.0.1:8000/restaurants/", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error("Failed to add restaurant");
        const newRest = await res.json();
        
        setRestaurants([...restaurants, newRest]);
        setRestForm({ name: "", category: RESTAURANT_CATEGORIES[0], city: "", street: "", number: "", rating: 5.0 });
        setIsRestModalOpen(false);
        alert("Wniosek został wysłany!");
    } catch (err) {
        console.error(err);
        alert("Błąd składania wniosku.");
    }
  };

  // 2. Poprawa odrzuconego wniosku (Resubmit)
  const handleUpdateRejected = async (e) => {
      e.preventDefault();
      if (!selectedRestaurant) return;

      try {
        const payload = {
            name: editForm.name,
            cuisines: editForm.category,
            city: editForm.city,
            street: editForm.street,
            number: editForm.number
        };

        const res = await fetch(`http://127.0.0.1:8000/restaurants/${selectedRestaurant.id}`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Update failed");
        const updated = await res.json();

        // Aktualizuj listę (zmień status na pending w stanie lokalnym)
        setRestaurants(restaurants.map(r => r.id === updated.id ? updated : r));
        setSelectedRestaurant(updated); // Odśwież wybrany
        alert("Wniosek poprawiony i wysłany do ponownej weryfikacji!");
      } catch (err) {
          console.error(err);
          alert("Błąd aktualizacji.");
      }
  };

  // 3. Usuwanie
  const handleRemoveRestaurant = async (e, restaurantId) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz usunąć ten lokal/wniosek?")) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/restaurants/${restaurantId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to delete");
        setRestaurants(restaurants.filter(r => r.id !== restaurantId));
        if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
            setSelectedRestaurant(null);
        }
    } catch (err) {
        alert("Błąd podczas usuwania.");
    }
  };

  // 4. Produkty
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    try {
      const newProduct = { 
          restaurant_id: selectedRestaurant.id, 
          name: prodForm.name, 
          price: Number(prodForm.price),
          category: prodForm.category
      };
      const res = await fetch("http://127.0.0.1:8000/restaurants/products", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) throw new Error("Failed to add product");
      const created = await res.json();
      setProducts([...products, created]);
      setProdForm({ name: "", price: "", category: MENU_CATEGORIES[2] });
      setIsProdModalOpen(false);
    } catch (err) { alert("Błąd dodawania produktu."); }
  };
  
  const handleRemoveProduct = async (productId) => {
    if(!window.confirm("Usunąć produkt?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/products/${productId}`, { 
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to remove product");
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) { alert("Błąd usuwania produktu."); }
  };

  // Helpery UI
  const getStatusBadge = (status) => {
      switch(status) {
          case 'approved': return <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded border border-green-200">Aktywna</span>;
          case 'rejected': return <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded border border-red-200">Odrzucona - Popraw!</span>;
          default: return <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded border border-yellow-200">Weryfikacja</span>;
      }
  };

  if (!hasAccess) return <div className="p-10 text-center text-white">Brak dostępu.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 dark:text-purple-400">
        Panel Właściciela
      </h1>

      <div className="max-w-7xl mx-auto h-[calc(100vh-150px)] min-h-[500px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            
            {/* --- LISTA RESTAURACJI --- */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                <div className="bg-purple-600 dark:bg-purple-800 p-4 flex justify-between items-center text-white">
                    <h2 className="text-xl font-bold">Twoje Wnioski</h2>
                    <button 
                        onClick={() => setIsRestModalOpen(true)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-purple-600 rounded-full hover:bg-purple-100 transition text-2xl font-bold leading-none pb-1"
                        title="Złóż nowy wniosek"
                    >
                    +
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {restaurants.length === 0 ? (
                        <p className="text-center text-gray-500 mt-4">Brak lokali. Złóż pierwszy wniosek!</p>
                    ) : (
                        restaurants.map(r => (
                        <div 
                            key={r.id}
                            onClick={() => handleSelectRestaurant(r)}
                            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 flex justify-between items-center border group ${
                            selectedRestaurant?.id === r.id 
                                ? "bg-white dark:bg-gray-800 border-2 border-purple-500 shadow-md scale-[1.01]" 
                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                        >
                            <div className="flex-1 overflow-hidden">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className={`font-bold truncate ${selectedRestaurant?.id === r.id ? "text-purple-600 dark:text-purple-400" : "text-gray-800 dark:text-white"}`}>
                                        {r.name}
                                    </h3>
                                    {getStatusBadge(r.status)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                                    <span className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded">
                                        {r.cuisines}
                                    </span>
                                </div>
                            </div>
                            
                            <button
                                onClick={(e) => handleRemoveRestaurant(e, r.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full ml-2"
                                title="Usuń"
                            >
                                🗑️
                            </button>
                        </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- PRAWA KOLUMNA: MENU LUB EDYCJA WNIOSKU --- */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative">
                
                {/* 1. STAN PUSTY */}
                {!selectedRestaurant && (
                    <div className="flex h-full items-center justify-center text-gray-400 flex-col gap-2 p-10 text-center">
                        <span className="text-4xl">👈</span>
                        <p className="text-lg">Wybierz lokal po lewej.</p>
                        <p className="text-sm">Jeśli lokal jest odrzucony, będziesz mógł go poprawić.</p>
                    </div>
                )}

                {/* 2. TRYB POPRAWY WNIOSKU (Dla Odrzuconych) */}
                {selectedRestaurant && selectedRestaurant.status === 'rejected' && editForm && (
                    <div className="p-8 flex flex-col h-full overflow-y-auto">
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 dark:bg-red-900/20 dark:border-red-600 rounded-r">
                            <h3 className="font-bold text-red-700 dark:text-red-400 text-lg mb-1">Wniosek Odrzucony</h3>
                            <p className="text-red-600 dark:text-red-300">
                                <strong>Powód odrzucenia przez Administratora:</strong><br/>
                                "{selectedRestaurant.rejection_reason || "Brak szczegółów."}"
                            </p>
                            <p className="text-sm mt-2 text-red-500 dark:text-red-400">
                                Popraw poniższe dane i wyślij wniosek ponownie.
                            </p>
                        </div>

                        <form onSubmit={handleUpdateRejected} className="space-y-4 max-w-lg">
                            <div>
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Nazwa Lokalu</label>
                                <input 
                                    type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Kategoria</label>
                                <select 
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editForm.category} onChange={e => setEditForm({...editForm, category: e.target.value})}
                                >
                                    {RESTAURANT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Miasto</label>
                                    <input 
                                        type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Ulica</label>
                                    <input 
                                        type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={editForm.street} onChange={e => setEditForm({...editForm, street: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-gray-500 dark:text-gray-400">Numer</label>
                                <input 
                                    type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={editForm.number} onChange={e => setEditForm({...editForm, number: e.target.value})}
                                />
                            </div>

                            <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded shadow-lg transition transform hover:scale-[1.02]">
                                📤 Popraw i Wyślij do Weryfikacji
                            </button>
                        </form>
                    </div>
                )}

                {/* 3. TRYB ZWYKŁY (Menu dla Approved/Pending) */}
                {selectedRestaurant && selectedRestaurant.status !== 'rejected' && (
                    <>
                        <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600 h-[72px]">
                            <h2 className="text-xl font-bold truncate">
                                Menu: {selectedRestaurant.name}
                            </h2>
                            <button 
                                onClick={() => setIsProdModalOpen(true)}
                                className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition text-2xl font-bold leading-none pb-1"
                                title="Dodaj produkt"
                            >
                            +
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
                            {selectedRestaurant.status === 'pending' && (
                                <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-200 text-sm">
                                    Lokal oczekuje na weryfikację. Możesz już układać menu.
                                </div>
                            )}

                            {loadingProducts ? (
                                <p className="text-center mt-4">Ładowanie menu...</p>
                            ) : products.length === 0 ? (
                                <div className="text-center mt-10 text-gray-500">
                                    <p className="text-xl mb-2">Puste menu 😔</p>
                                    <p>Dodaj dania!</p>
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                {products.map(p => (
                                    <li key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition">
                                        <div>
                                            <span className="font-bold text-lg">{p.name}</span>
                                            <div className="text-xs text-gray-400 uppercase font-semibold">{p.category}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-purple-600 dark:text-purple-300 font-bold">{p.price.toFixed(2)} zł</span>
                                            <button 
                                                onClick={() => handleRemoveProduct(p.id)}
                                                className="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg"
                                            >✕</button>
                                        </div>
                                    </li>
                                ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
      </div>

      {/* --- MODALE --- */}
      {/* 1. Modal Nowego Wniosku */}
      <Modal isOpen={isRestModalOpen} onClose={() => setIsRestModalOpen(false)} title="Złóż wniosek o nową restaurację">
        <form onSubmit={handleAddRestaurant} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nazwa restauracji</label>
                <input 
                    type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={restForm.name} onChange={e => setRestForm({...restForm, name: e.target.value})} required placeholder="np. Pizzeria Italiana"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Kategoria Kuchni</label>
                <select 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    value={restForm.category} onChange={e => setRestForm({...restForm, category: e.target.value})}
                >
                    {RESTAURANT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            
            <div className="border-t pt-2 mt-2">
                <h4 className="text-sm font-bold text-gray-500 mb-2">Adres lokalu</h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="col-span-2">
                        <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white" value={restForm.city} onChange={e => setRestForm({...restForm, city: e.target.value})} required placeholder="Miasto" />
                    </div>
                    <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white" value={restForm.street} onChange={e => setRestForm({...restForm, street: e.target.value})} required placeholder="Ulica" />
                    <input type="text" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:text-white" value={restForm.number} onChange={e => setRestForm({...restForm, number: e.target.value})} required placeholder="Nr" />
                </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">Wyślij wniosek</button>
        </form>
      </Modal>

      {/* 2. Modal Produktu */}
      <Modal isOpen={isProdModalOpen} onClose={() => setIsProdModalOpen(false)} title={`Dodaj produkt`}>
        <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Kategoria</label>
                <select className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={prodForm.category} onChange={e => setProdForm({...prodForm, category: e.target.value})}>
                    {MENU_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <input type="text" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={prodForm.name} onChange={e => setProdForm({...prodForm, name: e.target.value})} required placeholder="Nazwa produktu" />
            <input type="number" step="0.01" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" value={prodForm.price} onChange={e => setProdForm({...prodForm, price: e.target.value})} required placeholder="Cena" />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg">Dodaj</button>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;
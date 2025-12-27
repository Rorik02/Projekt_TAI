import React, { useState, useEffect } from "react";
import Modal from "../components/Modal/Modal";
import MapComponent from "../components/Map/Map"; // <--- TA LINIA JEST KLUCZOWA!

// Lista dostępnych kategorii
const CATEGORIES = [
  "Italian", "Japanese", "American", "Chinese", "Mexican",
  "Indian", "French", "Mediterranean", "Thai", "Fast Food", "Vegetarian", "Polish", "Burger", "Pizza", "Sushi"
];

const Dashboard = () => {
  const ownerUsername = localStorage.getItem("owner_username");
  
  // --- STANY ---
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Stany Modali
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);

  // Formularz Restauracji
  const [restForm, setRestForm] = useState({ 
      name: "", 
      category: CATEGORIES[0], 
      city: "",
      street: "",
      number: "",
      rating: 5.0 
  });
  
  // Formularz Produktu
  const [prodForm, setProdForm] = useState({ name: "", price: "" });

  // --- ŁADOWANIE DANYCH ---
  useEffect(() => {
    loadRestaurants();
  }, [ownerUsername]);

  const loadRestaurants = async () => {
    if (!ownerUsername) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectRestaurant = async (restaurant) => {
    setSelectedRestaurant(restaurant);
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

  // --- OBSŁUGA RESTAURACJI ---
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
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) throw new Error("Failed to add restaurant");
        const newRest = await res.json();
        
        setRestaurants([...restaurants, newRest]);
        setRestForm({ 
            name: "", category: CATEGORIES[0], city: "", street: "", number: "", rating: 5.0 
        });
        setIsRestModalOpen(false);
        handleSelectRestaurant(newRest);
    } catch (err) {
        console.error(err);
        alert("Błąd dodawania restauracji.");
    }
  };

  const handleRemoveRestaurant = async (e, restaurantId) => {
    e.stopPropagation();
    if (!window.confirm("Czy na pewno chcesz usunąć tę restaurację?")) return;

    try {
        const res = await fetch(`http://127.0.0.1:8000/restaurants/${restaurantId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete");
        setRestaurants(restaurants.filter(r => r.id !== restaurantId));
        if (selectedRestaurant && selectedRestaurant.id === restaurantId) {
            setSelectedRestaurant(null);
            setProducts([]);
        }
    } catch (err) {
        console.error(err);
        alert("Błąd podczas usuwania.");
    }
  };

  // --- OBSŁUGA PRODUKTÓW ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedRestaurant) return;
    try {
      const newProduct = { 
          restaurant_id: selectedRestaurant.id, 
          name: prodForm.name, 
          price: Number(prodForm.price) 
      };
      const res = await fetch("http://127.0.0.1:8000/restaurants/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) throw new Error("Failed to add product");
      const created = await res.json();
      setProducts([...products, created]);
      setProdForm({ name: "", price: "" });
      setIsProdModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Błąd dodawania produktu.");
    }
  };
  
  const handleRemoveProduct = async (productId) => {
    if(!window.confirm("Usunąć produkt?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/products/${productId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove product");
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
        console.error(err);
        alert("Błąd usuwania produktu.");
    }
  };

  if (!ownerUsername) return <div className="min-h-screen flex items-center justify-center dark:text-white">Brak dostępu.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-600 dark:text-purple-400">
        Panel Zarządzania Menu
      </h1>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* --- SEKCJA MAPY --- */}
        <div className="w-full">
            <h2 className="text-xl font-bold mb-2 ml-1">Lokalizacja Twoich Restauracji</h2>
            
            {/* Tutaj przekazujemy propsy do interaktywnej mapy */}
            <MapComponent 
                restaurants={restaurants} 
                selectedRestaurant={selectedRestaurant} 
                onSelect={handleSelectRestaurant} 
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-600px)] min-h-[400px]">
            {/* --- KOLUMNA 1: MOJE RESTAURACJE --- */}
            <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
            <div className="bg-purple-600 dark:bg-purple-800 p-4 flex justify-between items-center text-white">
                <h2 className="text-xl font-bold">Moje Restauracje</h2>
                <button 
                onClick={() => setIsRestModalOpen(true)}
                className="w-8 h-8 flex items-center justify-center bg-white text-purple-600 rounded-full hover:bg-purple-100 transition text-2xl font-bold leading-none pb-1"
                title="Dodaj restaurację"
                >
                +
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {restaurants.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Brak restauracji. Dodaj pierwszą!</p>
                ) : (
                    restaurants.map(r => (
                    <div 
                        key={r.id}
                        onClick={() => handleSelectRestaurant(r)}
                        className={`p-4 rounded-lg cursor-pointer transition flex justify-between items-center border group ${
                        selectedRestaurant?.id === r.id 
                            ? "bg-purple-100 border-purple-300 dark:bg-purple-900/40 dark:border-purple-500" 
                            : "bg-gray-50 border-gray-200 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                        }`}
                    >
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-bold truncate">{r.name}</h3>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-wrap gap-2">
                                <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-200">
                                    {r.cuisines}
                                </span>
                            </div>
                            {(r.street || r.city) && (
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1 truncate">
                                    📍 {r.street} {r.number}, {r.city}
                                </p>
                            )}
                        </div>
                        
                        <div className="flex items-center ml-2">
                            <button
                                onClick={(e) => handleRemoveRestaurant(e, r.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-full mr-2"
                                title="Usuń restaurację"
                            >
                                🗑️
                            </button>
                            {selectedRestaurant?.id === r.id && <span className="text-purple-600 dark:text-purple-400 text-xl">●</span>}
                        </div>
                    </div>
                    ))
                )}
            </div>
            </div>

            {/* --- KOLUMNA 2: MENU --- */}
            <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden relative">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-600 h-[72px]">
                <h2 className="text-xl font-bold truncate">
                    {selectedRestaurant ? `Menu: ${selectedRestaurant.name}` : "Wybierz restaurację"}
                </h2>
                {selectedRestaurant && (
                    <button 
                    onClick={() => setIsProdModalOpen(true)}
                    className="w-8 h-8 flex items-center justify-center bg-purple-600 text-white rounded-full hover:bg-purple-700 transition text-2xl font-bold leading-none pb-1"
                    title="Dodaj produkt"
                    >
                    +
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
                {!selectedRestaurant ? (
                    <div className="flex h-full items-center justify-center text-gray-400">
                        <p className="text-lg">👈 Wybierz restaurację z listy po lewej</p>
                    </div>
                ) : loadingProducts ? (
                    <p className="text-center mt-4">Ładowanie menu...</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-gray-500 mt-4">Menu jest puste. Dodaj produkty!</p>
                ) : (
                    <ul className="space-y-2">
                    {products.map(p => (
                        <li key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-600 hover:shadow-md transition">
                            <span className="font-medium">{p.name}</span>
                            <div className="flex items-center gap-4">
                                <span className="text-purple-600 dark:text-purple-300 font-bold">{p.price.toFixed(2)} zł</span>
                                <button 
                                    onClick={() => handleRemoveProduct(p.id)}
                                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition px-2 font-bold"
                                >
                                ✕
                                </button>
                            </div>
                        </li>
                    ))}
                    </ul>
                )}
            </div>
            </div>
        </div>
      </div>

      {/* --- MODALE --- */}
      
      {/* Modal Dodawania Restauracji */}
      <Modal isOpen={isRestModalOpen} onClose={() => setIsRestModalOpen(false)} title="Dodaj nową restaurację">
        <form onSubmit={handleAddRestaurant} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nazwa restauracji</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                    value={restForm.name}
                    onChange={e => setRestForm({...restForm, name: e.target.value})}
                    required
                    placeholder="np. Pizzeria Italiana"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Kategoria</label>
                <select 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                    value={restForm.category}
                    onChange={e => setRestForm({...restForm, category: e.target.value})}
                >
                    {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="border-t pt-2 mt-2">
                <h4 className="text-sm font-bold text-gray-500 mb-2">Adres lokalu</h4>
                <div className="mb-2">
                    <label className="block text-xs font-medium mb-1 dark:text-gray-400">Miasto</label>
                    <input 
                        type="text" 
                        className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                        value={restForm.city}
                        onChange={e => setRestForm({...restForm, city: e.target.value})}
                        required
                        placeholder="np. Warszawa"
                    />
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Ulica</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                            value={restForm.street}
                            onChange={e => setRestForm({...restForm, street: e.target.value})}
                            required
                            placeholder="np. Marszałkowska"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1 dark:text-gray-400">Numer</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                            value={restForm.number}
                            onChange={e => setRestForm({...restForm, number: e.target.value})}
                            required
                            placeholder="np. 10/24"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-1 italic">Na podstawie adresu automatycznie pobierzemy lokalizację na mapie.</p>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">
                Zapisz i pobierz lokalizację
            </button>
        </form>
      </Modal>
      
      {/* Modal Dodawania Produktu */}
      <Modal isOpen={isProdModalOpen} onClose={() => setIsProdModalOpen(false)} title={`Dodaj produkt do: ${selectedRestaurant?.name}`}>
        <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Nazwa produktu</label>
                <input 
                    type="text" 
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                    value={prodForm.name}
                    onChange={e => setProdForm({...prodForm, name: e.target.value})}
                    required
                    placeholder="np. Pizza Margherita"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Cena (PLN)</label>
                <input 
                    type="number"
                    step="0.01"
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none dark:text-white"
                    value={prodForm.price}
                    onChange={e => setProdForm({...prodForm, price: e.target.value})}
                    required
                    placeholder="np. 29.99"
                />
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-medium transition">
                Dodaj produkt
            </button>
        </form>
      </Modal>

    </div>
  );
};

export default Dashboard;
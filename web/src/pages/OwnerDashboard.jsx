import React, { useState, useEffect } from "react";
// Usuwamy import "./OwnerDashboard.css";

const Dashboard = () => {
  const ownerUsername = localStorage.getItem("owner_username");
  const [restaurants, setRestaurants] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [formMap, setFormMap] = useState({});

  const loadRestaurants = async () => {
    if (!ownerUsername) return;
    try {
      // Pamiętaj o URL - użyliśmy /restaurants w Twoim nowym routerze, 
      // ale jeśli chcesz filtrować po właścicielu, backend musi to obsługiwać.
      // Na razie pobieramy wszystkie (zgodnie z uproszczonym backendem).
      const res = await fetch(`http://127.0.0.1:8000/restaurants`);
      if (!res.ok) throw new Error("Failed to fetch restaurants");
      const data = await res.json();
      setRestaurants(data);

      const initialForms = {};
      const initialProducts = {};
      
      // Inicjalizacja formularzy
      for (const r of data) {
        initialForms[r.id] = { name: "", price: "" };
        initialProducts[r.id] = [];
        loadProducts(r.id, initialProducts);
      }
      setFormMap(initialForms);
    } catch (err) {
      console.error("Error loading restaurants:", err);
    }
  };

  const loadProducts = async (restaurantId, tempMap = null) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/${restaurantId}/products`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      
      if (tempMap) {
        tempMap[restaurantId] = data;
        setProductsMap({ ...tempMap });
      } else {
        setProductsMap(prev => ({ ...prev, [restaurantId]: data }));
      }
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  useEffect(() => {
    loadRestaurants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerUsername]);

  const handleFormChange = (restaurantId, e) => {
    const { name, value } = e.target;
    setFormMap(prev => ({
      ...prev,
      [restaurantId]: { ...prev[restaurantId], [name]: value }
    }));
  };

  const handleAddProduct = async (restaurantId, e) => {
    e.preventDefault();
    const form = formMap[restaurantId];
    if (!form?.name || !form?.price) return;

    const newProduct = { restaurant_id: Number(restaurantId), name: form.name, price: Number(form.price) };
    try {
      const res = await fetch("http://127.0.0.1:8000/restaurants/products", { // <-- Zaktualizowany URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct)
      });
      if (!res.ok) throw new Error("Failed to add product");
      const created = await res.json();

      setProductsMap(prev => ({ ...prev, [restaurantId]: [...(prev[restaurantId] || []), created] }));
      setFormMap(prev => ({ ...prev, [restaurantId]: { name: "", price: "" } }));
    } catch (err) {
      console.error(err);
      alert("Błąd dodawania produktu. Sprawdź backend.");
    }
  };

  const handleRemoveProduct = async (restaurantId, productId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/restaurants/products/${productId}`, { method: "DELETE" }); // <-- Zaktualizowany URL
      if (!res.ok) throw new Error("Failed to remove product");

      setProductsMap(prev => ({ ...prev, [restaurantId]: prev[restaurantId].filter(p => p.id !== productId) }));
    } catch (err) {
      console.error(err);
      alert("Błąd usuwania produktu.");
    }
  };

  if (!ownerUsername) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white flex items-center justify-center">
        <p className="text-xl">Zaloguj się jako partner, aby zarządzać menu.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-purple-600 dark:text-purple-400">
        Panel Zarządzania Menu
      </h1>

      <div className="max-w-4xl mx-auto space-y-8">
        {restaurants.map(r => (
          <div key={r.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-4 border-b pb-2 border-gray-200 dark:border-gray-600">
                {r.name} <span className="text-sm font-normal text-gray-500">({r.cuisines.join(", ")})</span>
            </h2>
            
            {/* Formularz dodawania */}
            <form onSubmit={e => handleAddProduct(r.id, e)} className="flex gap-4 mb-6 items-end flex-wrap">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nazwa produktu</label>
                <input 
                    type="text" 
                    name="name" 
                    placeholder="Np. Pizza Margherita" 
                    value={formMap[r.id]?.name || ""} 
                    onChange={e => handleFormChange(r.id, e)} 
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
                    required 
                />
              </div>
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cena (PLN)</label>
                <input 
                    type="number" 
                    name="price" 
                    placeholder="0.00" 
                    value={formMap[r.id]?.price || ""} 
                    onChange={e => handleFormChange(r.id, e)} 
                    className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 outline-none"
                    required 
                />
              </div>
              <button type="submit" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition font-medium h-[42px]">
                Dodaj
              </button>
            </form>

            {/* Lista produktów */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 text-gray-600 dark:text-gray-300 uppercase text-xs tracking-wider">Aktualne Menu</h3>
              {(productsMap[r.id] || []).length === 0 ? (
                <p className="text-gray-500 italic text-sm">Brak produktów w menu.</p>
              ) : (
                <ul className="space-y-2">
                  {(productsMap[r.id] || []).map(p => (
                    <li key={p.id} className="flex justify-between items-center bg-white dark:bg-gray-600 p-3 rounded shadow-sm">
                      <span className="font-medium">{p.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-purple-600 dark:text-purple-300 font-bold">{p.price} zł</span>
                        <button 
                            className="bg-red-100 hover:bg-red-200 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 p-2 rounded transition"
                            onClick={() => handleRemoveProduct(r.id, p.id)}
                            title="Usuń"
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
        ))}
        
        {restaurants.length === 0 && (
            <p className="text-center text-gray-500">Brak restauracji do wyświetlenia.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
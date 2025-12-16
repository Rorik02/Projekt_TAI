import React, { useState, useEffect } from 'react';
import Map from '../Map/Map';


const CATEGORIES = [
  "Wszystkie", "Italian", "Japanese", "American", "Chinese", "Mexican",
  "Indian", "French", "Mediterranean", "Thai", "Fast Food", "Vegetarian", "Polish", "Burger", "Pizza", "Sushi"
];

const RestaurantsList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- STANY FILTRÓW ---
    const [minRating, setMinRating] = useState(0);
    const [selectedCuisine, setSelectedCuisine] = useState("Wszystkie");

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/restaurants');
            if (response.ok) {
                const data = await response.json();
                setRestaurants(data);
            }
        } catch (error) {
            console.error("Błąd pobierania restauracji:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIKA FILTROWANIA ---
    const filteredRestaurants = restaurants.filter(restaurant => {
        // 1. Filtr Oceny
        if (restaurant.rating < minRating) return false;
        
        // 2. Filtr Kuchni
        if (selectedCuisine !== "Wszystkie") {
            // Sprawdzamy czy fraza (np. "Italian") znajduje się w stringu cuisines (np. "Italian, Pizza")
            // Backend zwraca cuisines jako string lub listę - obsłużmy oba przypadki:
            const cuisinesData = Array.isArray(restaurant.cuisines) 
                ? restaurant.cuisines.join(" ") 
                : restaurant.cuisines || "";
            
            if (!cuisinesData.toLowerCase().includes(selectedCuisine.toLowerCase())) {
                return false;
            }
        }
        return true;
    });

    return (
        // GŁÓWNY KONTENER - Układ Flexbox na pełną wysokość minus Navbar (ok. 80px)
        <div className="flex h-[calc(100vh-80px)] overflow-hidden">
            
            {/* --- KOLUMNA LEWA: LISTA (Szerokość 40% lub stała na dużych ekranach) --- */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                
                {/* NAGŁÓWEK Z FILTRAMI (Przyklejony na górze listy) */}
                <div className="p-4 bg-white dark:bg-gray-800 shadow-sm z-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Odkryj Restauracje ({filteredRestaurants.length})
                    </h2>
                    
                    <div className="flex flex-col gap-3">
                        {/* Filtr Kuchni */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Rodzaj Kuchni</label>
                            <select 
                                value={selectedCuisine}
                                onChange={(e) => setSelectedCuisine(e.target.value)}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filtr Oceny */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Minimalna ocena</label>
                            <select 
                                value={minRating}
                                onChange={(e) => setMinRating(Number(e.target.value))}
                                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-700 border-none rounded-lg text-sm focus:ring-2 focus:ring-purple-500 dark:text-white"
                            >
                                <option value={0}>Wszystkie</option>
                                <option value={3}>3.0+ ⭐</option>
                                <option value={4}>4.0+ ⭐⭐</option>
                                <option value={4.5}>4.5+ ⭐⭐⭐</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* SCROLLOWALNA LISTA RESTAURACJI */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {loading ? (
                        <p className="text-center text-gray-500 py-10">Ładowanie...</p>
                    ) : filteredRestaurants.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 dark:text-gray-400">Brak wyników dla tych filtrów.</p>
                            <button 
                                onClick={() => { setMinRating(0); setSelectedCuisine("Wszystkie"); }}
                                className="mt-2 text-purple-600 hover:underline text-sm font-bold"
                            >
                                Wyczyść filtry
                            </button>
                        </div>
                    ) : (
                        filteredRestaurants.map((restaurant) => (
                            <div 
                                key={restaurant.id} 
                                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition cursor-pointer flex justify-between items-start group"
                            >
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition">
                                        {restaurant.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : restaurant.cuisines}
                                    </p>
                                    
                                    {/* Wyświetlanie adresu jeśli jest */}
                                    {restaurant.address && (
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            📍 {restaurant.address}
                                        </p>
                                    )}
                                </div>
                                
                                {/* Ocena */}
                                <div className="flex flex-col items-end">
                                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                        {restaurant.rating} ⭐
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- KOLUMNA PRAWA: MAPA --- */}
            <div className="hidden md:block flex-1 bg-gray-200 dark:bg-gray-900 relative border-l border-gray-300 dark:border-gray-700 p-6">
                
                {/* Kontener "Karty" mapy - to on tworzy efekt ramki i cienia */}
                <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 relative">
                    <Map restaurants={filteredRestaurants} />
                </div>

            </div>

        </div>
    );
}

export default RestaurantsList;
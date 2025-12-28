import React, { useState, useEffect } from 'react';
import Map from '../Map/Map';
import MenuModal from '../MenuModal/MenuModal';

const CATEGORIES = [
  "Wszystkie", "Italian", "Japanese", "American", "Chinese", "Mexican",
  "Indian", "French", "Mediterranean", "Thai", "Fast Food", "Vegetarian", "Polish", "Burger", "Pizza", "Sushi"
];

const RestaurantsList = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    
    // --- STANY MENU (Nowość) ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuProducts, setMenuProducts] = useState([]);
    const [menuRestaurant, setMenuRestaurant] = useState(null);

    // --- STANY FILTRÓW (Twoje) ---
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

    // --- FUNKCJA OTWIERAJĄCA MENU (Logika backendu) ---
    const handleOpenMenu = async (restaurant) => {
        setMenuRestaurant(restaurant);
        setMenuProducts([]); 
        setIsMenuOpen(true); 

        try {
            const res = await fetch(`http://127.0.0.1:8000/restaurants/${restaurant.id}/products`);
            if (res.ok) {
                const products = await res.json();
                setMenuProducts(products);
            }
        } catch (err) {
            console.error("Błąd menu:", err);
        }
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        if (restaurant.rating < minRating) return false;
        if (selectedCuisine !== "Wszystkie") {
            const cuisinesData = Array.isArray(restaurant.cuisines) 
                ? restaurant.cuisines.join(" ") 
                : restaurant.cuisines || "";
            if (!cuisinesData.toLowerCase().includes(selectedCuisine.toLowerCase())) return false;
        }
        return true;
    });

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden relative">
            
            {/* MODAL (Okno z menu) */}
            <MenuModal 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                restaurant={menuRestaurant}
                products={menuProducts}
            />

            {/* --- KOLUMNA LEWA: LISTA --- */}
            <div className="w-full md:w-2/5 lg:w-1/3 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
                
                {/* NAGŁÓWEK Z FILTRAMI (Przywrócony Twój styl) */}
                <div className="p-4 bg-white dark:bg-gray-800 shadow-sm z-10">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                        Odkryj Restauracje ({filteredRestaurants.length})
                    </h2>
                    
                    <div className="flex flex-col gap-3">
                        {/* Filtr Kuchni - Twój oryginalny styl */}
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

                        {/* Filtr Oceny - Twój oryginalny styl */}
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
                                onClick={() => setSelectedRestaurant(restaurant)}
                                className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group border ${
                                    selectedRestaurant?.id === restaurant.id 
                                    ? "border-purple-500 ring-1 ring-purple-500" 
                                    : "border-gray-100 dark:border-gray-700"
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition">
                                            {restaurant.name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {Array.isArray(restaurant.cuisines) ? restaurant.cuisines.join(", ") : restaurant.cuisines}
                                        </p>
                                        
                                        {restaurant.street && (
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                📍 {restaurant.street} {restaurant.number}, {restaurant.city}
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="flex flex-col items-end">
                                        <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                                            {restaurant.rating} ⭐
                                        </span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenMenu(restaurant);
                                    }}
                                    className="mt-3 w-full bg-gray-100 hover:bg-purple-600 hover:text-white text-gray-600 py-2 rounded-lg text-sm font-semibold transition"
                                >
                                    Zobacz Menu
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* --- KOLUMNA PRAWA: MAPA --- */}
            <div className="hidden md:block flex-1 bg-gray-200 dark:bg-gray-900 relative border-l border-gray-300 dark:border-gray-700 p-6">
                <div className="w-full h-full bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 relative">
                    <Map 
                        restaurants={filteredRestaurants} 
                        selectedRestaurant={selectedRestaurant}
                        onSelect={setSelectedRestaurant}
                        onShowMenu={handleOpenMenu} // Przekazujemy funkcję do Mapy
                    />
                </div>
            </div>

        </div>
    );
}

export default RestaurantsList;
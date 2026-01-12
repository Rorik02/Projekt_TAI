import React, { useState } from 'react';
import MenuModal from '../MenuModal/MenuModal';

const CATEGORIES = [
  "Wszystkie", "Italian", "Japanese", "American", "Chinese", "Mexican",
  "Indian", "French", "Mediterranean", "Thai", "Fast Food", "Vegetarian", "Polish", "Burger", "Pizza", "Sushi"
];

// ODBIERAMY DANE PRZEZ PROPS (restaurants, onSelectRestaurant, selectedId)
const RestaurantsList = ({ restaurants, onSelectRestaurant, selectedId }) => {
    
    // --- STANY MENU ---
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuProducts, setMenuProducts] = useState([]);
    const [menuRestaurant, setMenuRestaurant] = useState(null);

    // --- STANY FILTRÓW ---
    const [minRating, setMinRating] = useState(0);
    const [selectedCuisine, setSelectedCuisine] = useState("Wszystkie");

    // --- FUNKCJA OTWIERAJĄCA MENU ---
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

    // --- FILTROWANIE (Na podstawie danych otrzymanych z props) ---
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
        <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
            
            {/* MODAL MENU (Niewidoczny, dopóki nie klikniesz) */}
            <MenuModal 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                restaurant={menuRestaurant}
                products={menuProducts}
            />

            {/* --- NAGŁÓWEK Z FILTRAMI --- */}
            <div className="p-4 bg-white dark:bg-gray-800 shadow-sm z-10 shrink-0">
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

            {/* --- LISTA KAFELKÓW (Scrollowalna) --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-500 dark:text-gray-400">Brak wyników.</p>
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
                            // Tu używamy funkcji przekazanej z rodzica (żeby mapa wiedziała co kliknięto)
                            onClick={() => onSelectRestaurant && onSelectRestaurant(restaurant)}
                            className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col group border ${
                                selectedId === restaurant.id 
                                ? "border-purple-500 ring-1 ring-purple-500 bg-purple-50 dark:bg-gray-800" 
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
                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                        📍 {restaurant.street} {restaurant.number}, {restaurant.city}
                                    </p>
                                </div>
                                <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs font-bold px-2 py-1 rounded-lg">
                                    {restaurant.rating} ⭐
                                </span>
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
            
            {/* USUNĘLIŚMY Z TEGO MIEJSCA PRAWĄ KOLUMNĘ Z MAPĄ */}
        </div>
    );
};

export default RestaurantsList;
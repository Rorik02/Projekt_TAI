import React, { useState } from "react";

import RestaurantMenu from "../RestaurantMenu/RestaurantMenu";

const categories = [
  "Italian","Japanese","American","Chinese","Mexican",
  "Indian","French","Mediterranean","Thai","Fast Food",
  "Vegetarian"
];

const CuisineList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openRestaurantId, setOpenRestaurantId] = useState(null);

  const fetchRestaurants = async (cuisine) => {
    setLoading(true);
    try {
      const url = cuisine
        ? `http://127.0.0.1:8000/restaurants?cuisine=${encodeURIComponent(cuisine)}`
        : "http://127.0.0.1:8000/restaurants";
      const res = await fetch(url);
      const data = await res.json();
      setRestaurants(data);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setRestaurants([]);
    }
    setLoading(false);
  };

  const handleCategoryClick = (cuisine) => {
    const newCuisine = selectedCuisine === cuisine ? null : cuisine;
    setSelectedCuisine(newCuisine);
    setOpenRestaurantId(null); 
    fetchRestaurants(newCuisine); 
  };

  const handleRestaurantClick = (id) => {
    setOpenRestaurantId(openRestaurantId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
      <h1 className="text-3xl font-bold text-center text-purple-700 dark:text-purple-400 mb-8">
        Wybierz Kuchnię
      </h1>

      {/* Kategorie (Przyciski) */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 border
              ${selectedCuisine === cat 
                ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-105" 
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Ładowanie wyników...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div
                onClick={() => handleRestaurantClick(r.id)}
                className="p-5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold">{r.name}</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded dark:bg-yellow-900 dark:text-yellow-300">
                    {r.rating} ⭐
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {r.cuisines.map((c, idx) => (
                    <span key={idx} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {c}
                    </span>
                  ))}
                </div>
                
                <p className="text-center text-sm text-purple-500 mt-2 font-medium">
                    {openRestaurantId === r.id ? "Zamknij menu" : "Pokaż menu"}
                </p>
              </div>

              {openRestaurantId === r.id && (
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
                  <RestaurantMenu restaurantId={r.id} />
                 </div>
              )}
            </div>
          ))}
          {restaurants.length === 0 && selectedCuisine && !loading && (
              <p className="text-center col-span-full text-gray-500">Brak restauracji w kategorii: {selectedCuisine}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CuisineList;
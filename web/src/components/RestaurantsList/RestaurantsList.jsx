import React, { useEffect, useState } from "react";
import RestaurantMenu from "../RestaurantMenu/RestaurantMenu";

const RestaurantsList = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [minRating, setMinRating] = useState(0);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/restaurants")
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching restaurants:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-gray-500 dark:text-gray-400">
      <p>Ładowanie restauracji...</p>
    </div>
  );

  const filteredRestaurants = restaurants
    .filter((r) => r.rating >= minRating)
    .sort((a, b) => b.rating - a.rating);

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-200">
      
      {/* Nagłówek i Filtr */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-4 md:mb-0">
          Dostępne Restauracje
        </h1>

        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600">
          <label htmlFor="rating-filter" className="text-sm font-medium text-gray-600 dark:text-gray-300">
            Min. ocena:
          </label>
          <select
            id="rating-filter"
            value={minRating}
            onChange={(e) => setMinRating(Number(e.target.value))}
            className="p-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value={0}>Wszystkie</option>
            <option value={1}>1 ⭐</option>
            <option value={2}>2 ⭐</option>
            <option value={3}>3 ⭐</option>
            <option value={4}>4 ⭐</option>
            <option value={5}>5 ⭐</option>
          </select>
        </div>
      </div>

      {/* Lista Kart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRestaurants.length > 0 ? (
          filteredRestaurants.map((restaurant) => (
            <div 
              key={restaurant.id} 
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              {/* Klikalna sekcja karty */}
              <div
                onClick={() =>
                  setSelectedRestaurantId(
                    selectedRestaurantId === restaurant.id ? null : restaurant.id
                  )
                }
                className="cursor-pointer p-5"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-purple-600 transition">
                    {restaurant.name}
                  </h2>
                  <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded text-yellow-700 dark:text-yellow-400 font-bold text-sm">
                    {restaurant.rating} <span className="ml-1">⭐</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {restaurant.cuisines.map((cuisine, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    >
                      {cuisine}
                    </span>
                  ))}
                </div>
                
                <div className="mt-4 text-center">
                    <span className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                        {selectedRestaurantId === restaurant.id ? "Ukryj menu ▲" : "Zobacz menu ▼"}
                    </span>
                </div>
              </div>

              {/* Rozwijane Menu */}
              {selectedRestaurantId === restaurant.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4 animate-fadeIn">
                  <RestaurantMenu restaurantId={restaurant.id} />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-500 text-lg mt-10">
            Brak restauracji spełniających kryteria.
          </p>
        )}
      </div>
    </div>
  );
};

export default RestaurantsList;
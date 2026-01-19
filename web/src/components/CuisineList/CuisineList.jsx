import React, { useState, useEffect } from "react";
import RestaurantMenu from "../RestaurantMenu/RestaurantMenu";

const CuisineList = () => {
  const [cuisines, setCuisines] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selectedCuisine, setSelectedCuisine] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openRestaurantId, setOpenRestaurantId] = useState(null);

  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/restaurants/cuisines");
        const data = await res.json();
        setCuisines(data);
      } catch (err) {
        console.error("Błąd pobierania kuchni:", err);
      }
    };

    fetchCuisines();
  }, []);

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
      console.error("Błąd pobierania restauracji:", err);
      setRestaurants([]);
    }
    setLoading(false);
  };

  const handleCuisineClick = (cuisine) => {
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
      <h1 className="text-3xl font-bold text-center text-purple-700 mb-8">
        Wybierz Kuchnię
      </h1>

      {/* LISTA KUCHNI */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            onClick={() => handleCuisineClick(cuisine)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition
              ${
                selectedCuisine === cuisine
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
              }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      {/* RESTAURACJE */}
      {loading ? (
        <p className="text-center">Ładowanie...</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-xl shadow border">
              <div
                onClick={() => handleRestaurantClick(r.id)}
                className="p-5 cursor-pointer hover:bg-gray-50"
              >
                <h3 className="font-bold text-lg">{r.name}</h3>

                <div className="flex flex-wrap gap-2 mt-2">
                  {r.cuisines.split(",").map((c, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {c.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {openRestaurantId === r.id && (
                <div className="border-t p-4 bg-gray-50">
                  <RestaurantMenu restaurantId={r.id} />
                </div>
              )}
            </div>
          ))}

          {restaurants.length === 0 && selectedCuisine && (
            <p className="col-span-full text-center text-gray-500">
              Brak restauracji dla kuchni: {selectedCuisine}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CuisineList;

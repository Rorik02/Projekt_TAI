import React, { useEffect, useState } from "react";


const RestaurantMenu = ({ restaurantId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/restaurants/${restaurantId}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, [restaurantId]);

  if (loading) return <p className="text-gray-500 text-center py-2">Ładowanie menu...</p>;
  if (products.length === 0) return <p className="text-gray-500 text-center py-2 text-sm italic">Brak produktów w menu tej restauracji.</p>;

  return (
    <ul className="space-y-3">
      {products.map((p) => (
        <li 
          key={p.id} 
          className="flex justify-between items-center p-3 rounded-lg bg-white border border-gray-100 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600 transition shadow-sm"
        >
          {/* Lewa strona: Nazwa i Cena */}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
            <span className="text-sm font-bold text-purple-600 dark:text-purple-300">{p.price} zł</span>
          </div>

          {/* Prawa strona: Przyciski */}
          <div className="flex items-center gap-3">
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60 transition font-bold"
              onClick={() => console.log(`Remove ${p.name}`)}
              title="Usuń"
            >
              -
            </button>
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-300 dark:hover:bg-green-900/60 transition font-bold"
              onClick={() => console.log(`Add ${p.name}`)}
              title="Dodaj"
            >
              +
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default RestaurantMenu;
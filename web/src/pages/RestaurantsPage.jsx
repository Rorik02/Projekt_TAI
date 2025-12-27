import React, { useState, useEffect } from 'react';
// Importujemy komponenty
import RestaurantsList from '../../components/RestaurantsList/RestaurantsList';
import MapComponent from '../../components/Map/Map'; // Upewnij się, że ścieżka jest poprawna!

const RestaurantsPage = () => {
    // 1. Tu trzymamy dane (żeby Mapa i Lista miały to samo)
    const [restaurants, setRestaurants] = useState([]);
    // 2. Tu trzymamy informację, co kliknięto (do sterowania mapą)
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    // 3. Pobieramy dane tutaj (raz, dla wszystkich)
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const response = await fetch("http://127.0.0.1:8000/restaurants");
                const data = await response.json();
                setRestaurants(data);
            } catch (error) {
                console.error("Błąd pobierania restauracji:", error);
            }
        };
        fetchRestaurants();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 flex flex-col">
            
            {/* Opcjonalny Nagłówek */}
            <div className="bg-white dark:bg-gray-800 shadow-sm py-4 px-6 z-10">
                <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    Znajdź lokal w okolicy 🍔
                </h1>
            </div>

            {/* Układ 2 kolumn: Lista + Mapa */}
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-80px)]">
                
                {/* KOLUMNA 1: LISTA */}
                <div className="lg:col-span-1 overflow-hidden h-full">
                    {/* Przekazujemy dane i funkcję do ustawiania wybranej restauracji */}
                    <RestaurantsList 
                        restaurants={restaurants} 
                        onSelectRestaurant={setSelectedRestaurant} 
                        selectedId={selectedRestaurant?.id}
                    />
                </div>

                {/* KOLUMNA 2: MAPA */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden relative min-h-[400px]">
                    <MapComponent 
                        restaurants={restaurants}
                        selectedRestaurant={selectedRestaurant} // Mapa dostaje sygnał, gdzie lecieć
                    />
                </div>

            </div>
        </div>
    );
}

export default RestaurantsPage;
import React from 'react';

// Kolejność wyświetlania kategorii w menu klienta
const CATEGORY_ORDER = ["Przystawka", "Zupa", "Danie główne", "Dodatek", "Deser", "Napój"];

const MenuModal = ({ isOpen, onClose, restaurant, products }) => {
    if (!isOpen) return null;

    // --- LOGIKA GRUPOWANIA PRODUKTÓW ---
    // 1. Grupujemy produkty po kategorii
    const groupedProducts = products.reduce((acc, product) => {
        const cat = product.category || "Inne"; // Jeśli brak kategorii, wrzuć do "Inne"
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    // 2. Ustalamy kolejność wyświetlania kategorii
    const activeCategories = CATEGORY_ORDER.filter(cat => groupedProducts[cat]);
    
    // Jeśli są kategorie spoza naszej listy (np. "Inne"), dodajemy je na końcu
    Object.keys(groupedProducts).forEach(cat => {
        if (!CATEGORY_ORDER.includes(cat)) {
            activeCategories.push(cat);
        }
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            
            <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                
                {/* Nagłówek Modala */}
                <div className="p-6 bg-purple-600 text-white flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
                        <p className="text-purple-100 text-sm mt-1">
                            {restaurant?.cuisines} • ⭐ {restaurant?.rating}
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 rounded-full w-10 h-10 flex items-center justify-center transition text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Lista Produktów (Grupowana) */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 scrollbar-thin scrollbar-thumb-purple-200">
                    {products.length === 0 ? (
                        <div className="text-center text-gray-500 py-10 flex flex-col items-center">
                            <span className="text-4xl mb-2">🍽️</span>
                            <p>Menu tej restauracji jest jeszcze puste.</p>
                        </div>
                    ) : (
                        // Mapujemy po kategoriach
                        activeCategories.map((category) => (
                            <div key={category} className="mb-8 last:mb-0">
                                {/* Nagłówek Sekcji */}
                                <h3 className="text-lg font-bold text-gray-400 uppercase tracking-wider mb-4 border-b pb-2 border-gray-200 dark:border-gray-700 sticky top-0 bg-gray-50 dark:bg-gray-900 py-2">
                                    {category}
                                </h3>

                                <div className="space-y-4">
                                    {groupedProducts[category].map((item) => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center group hover:border-purple-200 dark:hover:border-purple-800 transition">
                                            
                                            {/* Informacje o daniu */}
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white text-lg">
                                                    {item.name}
                                                </h3>
                                                <p className="text-gray-400 text-xs mt-1 font-medium">{category}</p>
                                            </div>

                                            {/* Cena i przycisk */}
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-purple-600 dark:text-purple-400 text-lg whitespace-nowrap">
                                                    {item.price.toFixed(2)} zł
                                                </span>
                                                
                                                <button 
                                                    onClick={() => alert(`Dodano do koszyka: ${item.name}`)}
                                                    className="bg-gray-100 dark:bg-gray-700 hover:bg-green-500 hover:text-white dark:hover:bg-green-600 text-gray-700 dark:text-gray-200 font-medium w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95"
                                                    title="Dodaj do koszyka"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Stopka */}
                <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-800 text-center text-xs text-gray-400 shrink-0">
                    Smacznego! 🍔
                </div>
            </div>
        </div>
    );
};

export default MenuModal;
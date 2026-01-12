import React, { useState } from 'react';

// --- MOCK DATA (Przykładowa historia zamówień) ---
const MOCK_HISTORY = [
    {
        id: "ORD-1024",
        date: "2023-10-27 14:30",
        restaurant: "Pizzeria U Luigiego",
        restaurantAddress: "Akademicka 18, Gliwice",
        deliveryAddress: "Dom (ul. Słoneczna 5, Gliwice)",
        total: 45.00,
        status: "completed", // Tylko zakończone
        payment: "BLIK",
        document: "Paragon",
        items: [
            { name: "Pizza Margherita", qty: 1, price: 30 },
            { name: "Cola Zero", qty: 2, price: 7.50 }
        ]
    },
    {
        id: "ORD-1023",
        date: "2023-10-26 19:15",
        restaurant: "Sushi Master",
        restaurantAddress: "Rynek 12, Katowice",
        deliveryAddress: "Praca (ul. Korfantego 1, Katowice)",
        total: 120.00,
        status: "completed",
        payment: "Karta",
        document: "Faktura VAT",
        items: [
            { name: "Zestaw Premium", qty: 1, price: 120 }
        ]
    },
    {
        id: "ORD-1020",
        date: "2023-10-20 12:00",
        restaurant: "Burger King",
        restaurantAddress: "Zwycięstwa 5, Gliwice",
        deliveryAddress: "Dom",
        total: 35.50,
        status: "cancelled", // Anulowane też tu trafiają
        payment: "BLIK",
        document: "Brak",
        items: [
            { name: "Double Whopper", qty: 1, price: 25.50 },
            { name: "Frytki", qty: 1, price: 10.00 }
        ]
    }
];

// Konfiguracja wyglądu statusów
const STATUS_CONFIG = {
    completed: { label: "Dostarczono", color: "bg-green-100 text-green-700 border-green-300", icon: "✅" },
    cancelled: { label: "Anulowano", color: "bg-red-100 text-red-700 border-red-300", icon: "❌" }
};

const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    const handleDownload = (type) => {
        // Tu w przyszłości będzie strzał do API po PDF
        alert(`Pobieranie dokumentu: ${type}...`);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pt-20"> {/* pt-20 żeby odsunąć od Navbara */}
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        📜 Historia Zamówień
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Tutaj znajdziesz wszystkie swoje zakończone pyszne przygody.
                    </p>
                </div>

                <div className="space-y-4">
                    {MOCK_HISTORY.map((order) => {
                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.completed;
                        
                        return (
                            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition">
                                
                                {/* Nagłówek Karty */}
                                <div className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-2xl">
                                            🏁
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.restaurant}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">📅 {order.date}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 w-fit ${status.color}`}>
                                        <span>{status.icon}</span> {status.label}
                                    </div>
                                </div>

                                {/* Treść: Adresy i Podsumowanie */}
                                <div className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center text-sm">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1 font-bold text-xs uppercase">
                                            Dostarczono do:
                                        </div>
                                        <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            📍 {order.deliveryAddress}
                                        </div>
                                    </div>
                                    
                                    <div className="flex gap-4">
                                         <div className="text-right">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Dokument</div>
                                            <div className="text-gray-800 dark:text-gray-300 font-medium">{order.document}</div>
                                         </div>
                                         <div className="text-right pl-4 border-l dark:border-gray-700">
                                            <div className="text-xs text-gray-500 uppercase font-bold">Kwota</div>
                                            <div className="text-purple-600 font-bold text-lg">{order.total.toFixed(2)} zł</div>
                                         </div>
                                    </div>
                                </div>

                                {/* Stopka: Przyciski */}
                                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end items-center gap-3">
                                    {order.status === 'completed' && (
                                        <button className="text-sm font-bold text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition underline decoration-dotted">
                                            Zamów ponownie ↻
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-lg font-bold text-gray-700 dark:text-white hover:bg-purple-50 dark:hover:bg-gray-600 hover:text-purple-600 transition shadow-sm"
                                    >
                                        Szczegóły i Faktura 📄
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL SZCZEGÓŁÓW (Taki sam styl jak Checkout) */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
                    
                    <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
                        {/* Header Modala */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Szczegóły zamówienia</h2>
                                <p className="text-sm text-purple-600 font-bold">#{selectedOrder.id}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
                        </div>

                        {/* Lista produktów */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3 mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Pozycje na rachunku</h3>
                            {selectedOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between text-sm items-center border-b border-gray-200 dark:border-gray-600 last:border-0 pb-2 last:pb-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 rounded text-xs">{item.qty}x</span>
                                        <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white">{(item.price * item.qty).toFixed(2)} zł</span>
                                </div>
                            ))}
                            <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-500 pt-3 mt-2 flex justify-between font-bold text-lg">
                                <span className="dark:text-white">Suma:</span>
                                <span className="text-purple-600">{selectedOrder.total.toFixed(2)} zł</span>
                            </div>
                        </div>

                        {/* Info o płatności */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 border rounded-xl dark:border-gray-600 bg-white dark:bg-gray-800">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Płatność</div>
                                <div className="font-bold dark:text-white flex items-center gap-2">
                                    {selectedOrder.payment === 'BLIK' ? '📱' : '💳'} {selectedOrder.payment}
                                </div>
                            </div>
                            <div className="p-3 border rounded-xl dark:border-gray-600 bg-white dark:bg-gray-800">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Dokument</div>
                                <div className="font-bold dark:text-white">{selectedOrder.document}</div>
                            </div>
                        </div>

                        {/* Przycisk Pobierania */}
                        <button 
                            onClick={() => handleDownload(selectedOrder.document)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2"
                        >
                            📥 Pobierz {selectedOrder.document} (PDF)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
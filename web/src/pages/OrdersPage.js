import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// --- MOCK DATA (Przykładowa historia zamówień) ---
const MOCK_HISTORY = [
    {
        id: "ORD-1024",
        date: "2023-10-27 14:30",
        restaurant: "Pizzeria U Luigiego",
        restaurantAddress: "Akademicka 18, Gliwice",
        deliveryAddress: "Dom (ul. Słoneczna 5, Gliwice)",
        total: 45.00,
        status: "completed",
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
    }
];

// Konfiguracja wyglądu statusów
const STATUS_CONFIG = {
    pending: { label: "Oczekujące", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: "⏳" },
    confirmed: { label: "Potwierdzone", color: "bg-blue-100 text-blue-700 border-blue-300", icon: "✅" },
    preparing: { label: "W przygotowaniu", color: "bg-purple-100 text-purple-700 border-purple-300", icon: "👨‍🍳" },
    delivering: { label: "W dostawie", color: "bg-orange-100 text-orange-700 border-orange-300", icon: "🚚" },
    delivered: { label: "Dostarczono", color: "bg-green-100 text-green-700 border-green-300", icon: "🎉" },
    cancelled: { label: "Anulowano", color: "bg-red-100 text-red-700 border-red-300", icon: "❌" },
    completed: { label: "Zakończono", color: "bg-green-100 text-green-700 border-green-300", icon: "✅" }
};

const STATUS_MAPPING = {
    confirmed: "Potwierdzone",
    preparing: "W przygotowaniu",
    delivering: "W dostawie",
    delivered: "Dostarczono",
    cancelled: "Anulowano",
    completed: "Zakończono"
};

const OrdersPage = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("access_token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }
        fetchOrders();
    }, [token, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await fetch("http://127.0.0.1:8000/orders/my-orders", {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Błąd ${response.status}: ${await response.text()}`);
            }

            const data = await response.json();
            console.log("Pobrane zamówienia:", data);
            setOrders(data);
        } catch (err) {
            console.error("Błąd pobierania zamówień:", err);
            setError(err.message);

            // Fallback na mock data jeśli backend nie odpowiada
            if (err.message.includes("404") || err.message.includes("500")) {
                console.log("Używam danych przykładowych");
                setOrders(MOCK_HISTORY);
                setError(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status) => {
        const mappedStatus = STATUS_MAPPING[status] || status;
        const config = STATUS_CONFIG[status] || STATUS_CONFIG.completed;
        return { ...config, label: mappedStatus };
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Brak daty";
        const date = new Date(dateString);
        return date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDownload = (orderId, type) => {
        alert(`Pobieranie dokumentu ${type} dla zamówienia #${orderId}...`);
    };

    const handleReOrder = (order) => {
        // TODO: Implementacja ponawiania zamówienia
        alert(`Funkcja ponawiania zamówienia z ${order.restaurant_name} wkrótce!`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 pt-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-gray-600 dark:text-gray-400">Ładowanie historii zamówień...</p>
                </div>
            </div>
        );
    }

    if (error && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 pt-20">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="text-4xl mb-4">❌</div>
                    <p className="text-red-600 dark:text-red-400 mb-4">Błąd: {error}</p>
                    <button 
                        onClick={fetchOrders}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg"
                    >
                        Spróbuj ponownie
                    </button>
                </div>
            </div>
        );
    }

    const displayOrders = orders.length > 0 ? orders : MOCK_HISTORY;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 pt-20">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        📜 Historia Zamówień
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Tutaj znajdziesz wszystkie swoje zamówienia ({displayOrders.length})
                    </p>
                    {error && (
                        <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded text-sm">
                            ⚠️ Uwaga: Wyświetlam dane przykładowe. Błąd backendu: {error}
                        </div>
                    )}
                </div>

                {displayOrders.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow">
                        <div className="text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                            Brak zamówień
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Złóż swoje pierwsze zamówienie!
                        </p>
                        <button 
                            onClick={() => navigate("/restaurants")}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            Przejdź do restauracji
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {displayOrders.map((order) => {
                            const status = getStatusConfig(order.status || 'completed');
                            const orderDate = order.created_at || order.date;
                            const restaurantName = order.restaurant_name || order.restaurant;
                            const restaurantAddress = order.restaurant_address || order.restaurantAddress;
                            const deliveryAddress = order.delivery_address || order.deliveryAddress;
                            const total = order.total_amount || order.total;
                            const paymentMethod = order.payment_method || order.payment;
                            const documentType = order.document_type || order.document;

                            return (
                                <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition">
                                    
                                    {/* Nagłówek Karty */}
                                    <div className="p-5 flex flex-col md:flex-row justify-between md:items-center gap-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-2xl">
                                                🏁
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{restaurantName}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    📅 {formatDate(orderDate)} | 
                                                    <span className="ml-2 font-mono">#{order.id}</span>
                                                </p>
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
                                                📍 {deliveryAddress}
                                            </div>
                                        </div>
                                        
                                        <div className="flex gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Płatność</div>
                                                <div className="text-gray-800 dark:text-gray-300 font-medium">
                                                    {paymentMethod === 'blik' ? '📱 BLIK' : '💳 Karta'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Dokument</div>
                                                <div className="text-gray-800 dark:text-gray-300 font-medium">
                                                    {documentType === 'invoice' ? 'Faktura VAT' : 'Paragon'}
                                                </div>
                                            </div>
                                            <div className="text-right pl-4 border-l dark:border-gray-700">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Kwota</div>
                                                <div className="text-purple-600 font-bold text-lg">{total.toFixed(2)} zł</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stopka: Przyciski */}
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 flex justify-end items-center gap-3">
                                        {['delivered', 'completed'].includes(order.status) && (
                                            <button 
                                                onClick={() => handleReOrder(order)}
                                                className="text-sm font-bold text-gray-600 hover:text-purple-600 dark:text-gray-300 dark:hover:text-purple-400 transition underline decoration-dotted"
                                            >
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
                )}
            </div>

            {/* MODAL SZCZEGÓŁÓW */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="absolute inset-0" onClick={() => setSelectedOrder(null)}></div>
                    
                    <div className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        {/* Header Modala */}
                        <div className="flex justify-between items-start mb-6 pb-4 border-b dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Szczegóły zamówienia</h2>
                                <p className="text-sm text-purple-600 font-bold">#{selectedOrder.id}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    📅 {formatDate(selectedOrder.created_at || selectedOrder.date)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-red-500 text-2xl bg-gray-100 dark:bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center transition">✕</button>
                        </div>

                        {/* Informacje ogólne */}
                        <div className="mb-6">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Restauracja</div>
                            <div className="font-bold dark:text-white text-lg">
                                {selectedOrder.restaurant_name || selectedOrder.restaurant}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                {selectedOrder.restaurant_address || selectedOrder.restaurantAddress}
                            </div>
                        </div>

                        {/* Lista produktów */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3 mb-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">Pozycje na rachunku</h3>
                            {(selectedOrder.items || []).map((item, idx) => {
                                const itemName = item.product_name || item.name;
                                const quantity = item.quantity || item.qty;
                                const price = item.price;
                                
                                return (
                                    <div key={idx} className="flex justify-between text-sm items-center border-b border-gray-200 dark:border-gray-600 last:border-0 pb-2 last:pb-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-purple-600 bg-purple-100 dark:bg-purple-900/50 px-2 rounded text-xs">
                                                {quantity}x
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200">{itemName}</span>
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {(price * quantity).toFixed(2)} zł
                                        </span>
                                    </div>
                                );
                            })}
                            <div className="border-t-2 border-dashed border-gray-300 dark:border-gray-500 pt-3 mt-2 flex justify-between font-bold text-lg">
                                <span className="dark:text-white">Suma:</span>
                                <span className="text-purple-600">
                                    {(selectedOrder.total_amount || selectedOrder.total).toFixed(2)} zł
                                </span>
                            </div>
                        </div>

                        {/* Info o płatności i dostawie */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-3 border rounded-xl dark:border-gray-600 bg-white dark:bg-gray-800">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Płatność</div>
                                <div className="font-bold dark:text-white flex items-center gap-2">
                                    {((selectedOrder.payment_method || selectedOrder.payment) === 'blik') ? '📱' : '💳'} 
                                    {selectedOrder.payment_method || selectedOrder.payment}
                                </div>
                            </div>
                            <div className="p-3 border rounded-xl dark:border-gray-600 bg-white dark:bg-gray-800">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Dokument</div>
                                <div className="font-bold dark:text-white">
                                    {selectedOrder.document_type === 'invoice' ? 'Faktura VAT' : 'Paragon'}
                                </div>
                            </div>
                        </div>

                        {/* Adres dostawy */}
                        <div className="p-3 border rounded-xl dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 mb-6">
                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Adres dostawy</div>
                            <div className="font-medium dark:text-white flex items-center gap-2">
                                📍 {selectedOrder.delivery_address || selectedOrder.deliveryAddress}
                            </div>
                        </div>

                        {/* Przycisk Pobierania */}
                        <button
                            onClick={() => handleDownload(selectedOrder.id, selectedOrder.document_type || selectedOrder.document)}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 flex justify-center items-center gap-2"
                        >
                            📥 Pobierz {selectedOrder.document_type === 'invoice' ? 'Fakturę' : 'Paragon'} (PDF)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
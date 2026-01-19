import React from "react";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "../CheckoutModal/CheckoutModal";

const CATEGORY_ORDER = ["Przystawka", "Zupa", "Danie główne", "Dodatek", "Deser", "Napój"];

const MenuModal = ({ isOpen, onClose, restaurant, products }) => {
    const {
        cartItems,
        addToCart,
        removeFromCart,
        cartCount,
        cartTotal
    } = useCart();
    const [checkoutOpen, setCheckoutOpen] = React.useState(false);

    const role = localStorage.getItem("user_role");
    const canOrder = role === "user";

    if (!isOpen) return null;

    const getQuantity = (productId) => {
        const item = cartItems.find((i) => i.id === productId);
        return item ? item.quantity : 0;
    };

    const groupedProducts = products.reduce((acc, product) => {
        const cat = product.category || "Inne";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {});

    const activeCategories = CATEGORY_ORDER.filter(cat => groupedProducts[cat]);
    Object.keys(groupedProducts).forEach(cat => {
        if (!CATEGORY_ORDER.includes(cat)) activeCategories.push(cat);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] z-10">

                {/* HEADER */}
                <div className="p-6 bg-purple-600 text-white flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{restaurant?.name}</h2>
                    <button onClick={onClose} className="text-xl">✕</button>
                </div>

                {/* MENU */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
                    {activeCategories.map(category => (
                        <div key={category} className="mb-6">
                            <h3 className="font-bold text-gray-400 mb-3">{category}</h3>

                            {groupedProducts[category].map(item => {
                                const qty = getQuantity(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl mb-2 border"
                                    >
                                        <div>
                                            <h4 className="font-bold">{item.name}</h4>
                                            <span className="text-purple-600 font-bold">
                                                {item.price.toFixed(2)} zł
                                            </span>
                                        </div>

                                        {canOrder ? (
                                            <div className="flex items-center gap-2">
                                                {qty > 0 && (
                                                    <>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 font-bold"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="min-w-[24px] text-center font-bold">
                                                            {qty}
                                                        </span>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => addToCart(item, restaurant)}
                                                    className="w-8 h-8 rounded-full bg-green-100 text-green-600 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Tylko dla klientów
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* STICKY KOSZYK */}
                {cartCount > 0 && canOrder && (
                    <div className="p-4 border-t bg-white dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold">🛒 {cartCount} produktów</span>
                            <span className="font-bold text-purple-600">
                                {cartTotal.toFixed(2)} zł
                            </span>
                        </div>

                        <button
                            className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold"
                            onClick={() => {
                                setCheckoutOpen(true);
                            }}

                        >
                            Przejdź do zamówienia →
                        </button>
                    </div>
                )}
            </div>
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
            />
        </div>
    );
};

export default MenuModal;

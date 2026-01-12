import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  // Stan koszyka: lista produktów
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('foodapp_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Stan restauracji: z którego lokalu zamawiamy (Zasada Jednej Restauracji)
  const [cartRestaurant, setCartRestaurant] = useState(() => {
    const saved = localStorage.getItem('foodapp_cart_restaurant');
    return saved ? JSON.parse(saved) : null;
  });

  // Zapisywanie do LocalStorage przy każdej zmianie
  useEffect(() => {
    localStorage.setItem('foodapp_cart', JSON.stringify(cartItems));
    localStorage.setItem('foodapp_cart_restaurant', JSON.stringify(cartRestaurant));
  }, [cartItems, cartRestaurant]);

  // --- FUNKCJE ---

  // Dodawanie produktu
  const addToCart = (product, restaurant) => {
    // 1. Sprawdź czy koszyk jest pusty lub czy produkt jest z TEJ SAMEJ restauracji
    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
        // Jeśli inna restauracja -> pytamy użytkownika (możemy to później zmienić na ładny modal)
        const confirmChange = window.confirm(
            `Masz już w koszyku produkty z restauracji "${cartRestaurant.name}". \nCzy chcesz wyczyścić koszyk i dodać produkt z "${restaurant.name}"?`
        );
        
        if (confirmChange) {
            clearCart();
            // Po wyczyszczeniu ustawiamy nową restaurację i dodajemy produkt (rekurencyjnie lub ręcznie poniżej)
            setCartRestaurant(restaurant);
            setCartItems([{ ...product, quantity: 1 }]);
        }
        return; // Przerywamy, jeśli user anulował lub po wyczyszczeniu
    }

    // 2. Jeśli ta sama restauracja (lub koszyk pusty)
    if (!cartRestaurant) {
        setCartRestaurant(restaurant);
    }

    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        if (existingItem) {
            // Zwiększ ilość
            return prevItems.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            // Dodaj nowy
            return [...prevItems, { ...product, quantity: 1 }];
        }
    });
  };

  // Usuwanie/Zmniejszanie ilości
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === productId);
        if (existingItem.quantity === 1) {
            // Usuń całkowicie
            const newCart = prevItems.filter(item => item.id !== productId);
            // Jeśli koszyk pusty, usuń też przypisaną restaurację
            if (newCart.length === 0) setCartRestaurant(null);
            return newCart;
        } else {
            // Zmniejsz ilość
            return prevItems.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
            );
        }
    });
  };

  // Całkowite czyszczenie koszyka
  const clearCart = () => {
    setCartItems([]);
    setCartRestaurant(null);
  };

  // Obliczanie sumy
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
        cartItems,
        cartRestaurant,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
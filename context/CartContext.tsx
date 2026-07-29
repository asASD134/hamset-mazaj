"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import type { CartItem } from "@/types/cart";

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("cart");

    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  function addToCart(item: CartItem) {
    setItems((current) => {
      const existing = current.find((p) => p.id === item.id);

      if (existing) {
        return current.map((p) =>
          p.id === item.id
            ? {
                ...p,
                quantity: p.quantity + 1,
              }
            : p
        );
      }

      return [...current, item];
    });
  }

  function removeFromCart(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setItems([]);
  }

  function isInCart(id: string) {
    return items.some((item) => item.id === id);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
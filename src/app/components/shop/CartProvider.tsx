"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface CartContextType {
  itemCount: number;
  refreshCart: () => Promise<void>;
  addToCart: (item: {
    productId: string;
    name: string;
    price: number;
    image: string;
    size: string;
    color: string;
    quantity: number;
  }) => Promise<boolean>;
}

const CartContext = createContext<CartContextType>({
  itemCount: 0,
  refreshCart: async () => {},
  addToCart: async () => false,
});

export function useCart() {
  return useContext(CartContext);
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [itemCount, setItemCount] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItemCount(data.itemCount || 0);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  }, []);

  const addToCart = useCallback(
    async (item: {
      productId: string;
      name: string;
      price: number;
      image: string;
      size: string;
      color: string;
      quantity: number;
    }): Promise<boolean> => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        const data = await res.json();

        if (res.ok) {
          setItemCount(data.itemCount || 0);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ itemCount, refreshCart, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

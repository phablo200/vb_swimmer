"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { useCart } from "@/app/components/shop/CartProvider";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export default function CarrinhoPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { refreshCart } = useCart();

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.cart?.items || []);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    const key = `${item.productId}-${item.size}-${item.color}`;
    setUpdating(key);

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: newQuantity,
        }),
      });

      if (res.ok) {
        await fetchCart();
        await refreshCart();
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (item: CartItem) => {
    const key = `${item.productId}-${item.size}-${item.color}`;
    setUpdating(key);

    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          size: item.size,
          color: item.color,
        }),
      });

      if (res.ok) {
        await fetchCart();
        await refreshCart();
      }
    } catch (error) {
      console.error("Erro ao remover item:", error);
    } finally {
      setUpdating(null);
    }
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const pixPrice = subtotal * 0.9;
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mt-6">
          Seu carrinho está vazio
        </h1>
        <p className="text-gray-500 mt-2">
          Explore nosso catálogo e encontre peças incríveis!
        </p>
        <Link
          href="/shop/catalog"
          className="inline-flex items-center gap-2 mt-6 bg-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
        >
          Ver Catálogo
          <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Carrinho de Compras
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const key = `${item.productId}-${item.size}-${item.color}`;
            const isUpdating = updating === key;

            return (
              <div
                key={key}
                className={`bg-white rounded-xl border border-gray-100 p-4 sm:p-6 flex gap-4 transition-opacity ${
                  isUpdating ? "opacity-50" : ""
                }`}
              >
                {/* Image */}
                <div className="relative w-20 h-24 sm:w-24 sm:h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiShoppingBag className="text-gray-300" size={24} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {item.name}
                  </h3>

                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.size && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Tam: {item.size}
                      </span>
                    )}
                    {item.color && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        Cor: {item.color}
                      </span>
                    )}
                  </div>

                  <p className="text-lg font-bold text-gray-900 mt-2">
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>

                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">
                      R$ {item.price.toFixed(2).replace(".", ",")} cada
                    </p>
                  )}

                  {/* Quantity controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        data-testid="btn-decrease"
                        onClick={() => updateQuantity(item, item.quantity - 1)}
                        disabled={isUpdating}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <FiMinus size={14} />
                      </button>
                      <span data-testid="item-quantity" className="px-3 text-sm font-medium text-gray-900 min-w-[32px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        data-testid="btn-increase"
                        onClick={() => updateQuantity(item, item.quantity + 1)}
                        disabled={isUpdating}
                        className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                      >
                        <FiPlus size={14} />
                      </button>
                    </div>

                    <button
                      data-testid="btn-remove"
                      onClick={() => removeItem(item)}
                      disabled={isUpdating}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo do Pedido
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{totalItems} {totalItems === 1 ? "item" : "itens"}</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-semibold text-gray-900 text-base">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>

              <div className="flex justify-between text-green-600 font-medium">
                <span>Com Pix (10% off)</span>
                <span>R$ {pixPrice.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="text-xs text-gray-400">
                ou 4x de R$ {(subtotal / 4).toFixed(2).replace(".", ",")} sem juros
              </div>
            </div>

            <Link
              href="/shop/checkout"
              className="mt-6 w-full bg-pink-600 text-white py-3.5 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center gap-2"
            >
              Finalizar Pedido
              <FiArrowRight />
            </Link>

            <Link
              href="/shop/catalog"
              className="mt-3 w-full text-center block text-sm text-gray-500 hover:text-pink-600 transition-colors"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

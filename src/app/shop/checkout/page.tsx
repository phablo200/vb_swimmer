"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FiShoppingBag,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Input from "@/app/components/ui/Input";
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

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

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

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const pixPrice = subtotal * 0.9;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail: customerEmail || undefined,
          notes: notes || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderNumber(data.order.orderNumber);
        setOrderComplete(true);
        await refreshCart();

        // Open WhatsApp in new tab
        window.open(data.whatsappUrl, "_blank");
      } else {
        setError(data.error || "Erro ao finalizar pedido");
      }
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck className="text-green-600" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido Realizado com Sucesso!
        </h1>
        <p className="text-gray-500 mt-3">
          Seu pedido <span className="font-semibold text-gray-900">#{orderNumber}</span>{" "}
          foi enviado via WhatsApp. Aguarde a confirmação.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Se a janela do WhatsApp não abriu, clique no botão abaixo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
          >
            Voltar à Loja
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mt-6">
          Carrinho vazio
        </h1>
        <p className="text-gray-500 mt-2">
          Adicione produtos ao carrinho antes de finalizar.
        </p>
        <Link
          href="/shop/catalog"
          className="inline-flex items-center gap-2 mt-6 bg-pink-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-pink-700 transition-colors"
        >
          Ver Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/shop/carrinho"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-pink-600 mb-6"
      >
        <FiArrowLeft size={14} />
        Voltar ao carrinho
      </Link>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
        Finalizar Pedido
      </h1>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} id="checkout-form" className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Seus Dados
              </h2>
              <div className="space-y-4">
                <Input
                  label="Nome Completo"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                />
                <Input
                  label="Telefone (WhatsApp)"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="(71) 99999-9999"
                  required
                />
                <Input
                  label="E-mail (opcional)"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Observações (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Alguma observação sobre o pedido?"
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Order items review */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Itens do Pedido
              </h2>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiShoppingBag className="text-gray-300" size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity}x R$ {item.price.toFixed(2).replace(".", ",")}
                        {item.size && ` • Tam: ${item.size}`}
                        {item.color && ` • ${item.color}`}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-shrink-0">
                      R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-6 sticky top-28">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resumo
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="flex justify-between text-green-600 font-medium">
                <span>Com Pix (10% off)</span>
                <span>R$ {pixPrice.toFixed(2).replace(".", ",")}</span>
              </div>

              <div className="text-xs text-gray-400">
                ou 4x de R$ {(subtotal / 4).toFixed(2).replace(".", ",")} sem juros
              </div>

              <div className="border-t border-gray-100 pt-3">
                <div className="flex justify-between font-bold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="mt-6 w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Enviando...
                </>
              ) : (
                <>
                  <FaWhatsapp size={22} />
                  Enviar Pedido via WhatsApp
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              Você será redirecionado para o WhatsApp com os detalhes do pedido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

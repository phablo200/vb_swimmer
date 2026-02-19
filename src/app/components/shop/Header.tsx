"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMenu, FiX, FiShoppingBag, FiShoppingCart } from "react-icons/fi";
import { useCart } from "./CartProvider";

const NAV_LINKS = [
  { href: "/shop", label: "Início" },
  { href: "/shop/catalog", label: "Catálogo" },
  { href: "/shop/catalog?category=Beachwear", label: "Beachwear" },
  { href: "/shop/catalog?category=Outwear", label: "Outwear" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount } = useCart();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-pink-600 text-white text-center text-xs py-1.5 font-medium tracking-wide">
        FRETE GRÁTIS acima de R$299 | Parcele em até 4x sem juros
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-gray-600 hover:text-gray-900"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/shop" className="flex items-center gap-2">
            <FiShoppingBag className="text-pink-600" size={28} />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              VB <span className="text-pink-600">Swimwear</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-pink-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Cart icon */}
          <Link
            href="/shop/carrinho"
            className="relative text-gray-600 hover:text-pink-600 transition-colors"
          >
            <FiShoppingCart size={24} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-pink-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/shop/carrinho"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
            >
              <FiShoppingCart size={16} />
              Carrinho {itemCount > 0 && `(${itemCount})`}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

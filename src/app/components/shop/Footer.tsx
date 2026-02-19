"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiShoppingBag, FiInstagram, FiMail, FiPhone } from "react-icons/fi";

interface FooterCategory {
  _id: string;
  name: string;
}

const appName = process.env.NEXT_PUBLIC_APP_NAME || "VB Swimwear";

export default function Footer() {
  const [categories, setCategories] = useState<FooterCategory[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/shop" className="flex items-center gap-2 mb-4">
              <FiShoppingBag className="text-pink-500" size={24} />
              <span className="text-lg font-bold text-white">
                {appName}
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Moda praia com elegância e sofisticação. Peças exclusivas
              pensadas para valorizar cada momento à beira-mar.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Categorias
            </h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    href={`/shop/catalog?category=${encodeURIComponent(cat.name)}`}
                    className="text-sm hover:text-pink-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/shop/catalog"
                  className="text-sm hover:text-pink-400 transition-colors"
                >
                  Todos os Produtos
                </Link>
              </li>
            </ul>
          </div>

          {/* Institutional */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Institucional
            </h3>
            <ul className="space-y-2">
              <li>
                <span className="text-sm">Quem Somos</span>
              </li>
              <li>
                <span className="text-sm">Perguntas Frequentes</span>
              </li>
              <li>
                <span className="text-sm">Como Comprar</span>
              </li>
              <li>
                <span className="text-sm">Trocas e Devoluções</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <FiPhone size={14} className="text-pink-500" />
                <span>+55 (85) 9943-0448</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FiMail size={14} className="text-pink-500" />
                <span>contato@vbswimwear.com.br</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <FiInstagram size={14} className="text-pink-500" />
                <span>@vbswimwear</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Meios de pagamento:</span>
              <div className="flex gap-2 text-xs text-gray-400">
                <span className="px-2 py-1 bg-gray-800 rounded">Visa</span>
                <span className="px-2 py-1 bg-gray-800 rounded">Mastercard</span>
                <span className="px-2 py-1 bg-gray-800 rounded">Pix</span>
                <span className="px-2 py-1 bg-gray-800 rounded">Boleto</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} {appName}. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

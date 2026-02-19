"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductGrid from "@/app/components/shop/ProductGrid";
import { FiArrowRight, FiSun, FiDroplet, FiStar } from "react-icons/fi";

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  discountPercent: number;
  pixDiscountPercent: number;
  images: string[];
  inStock: boolean;
}

export default function ShopHome() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/products?featured=true&limit=8");
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (error) {
        console.error("Erro ao carregar destaques:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-700 text-sm font-medium rounded-full mb-6">
              Nova Coleção 2026
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Moda Praia com{" "}
              <span className="text-pink-600">Elegância</span> e{" "}
              <span className="text-pink-600">Sofisticação</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
              Descubra peças exclusivas pensadas para valorizar cada momento à
              beira-mar. Design autoral com acabamentos refinados.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop/catalog"
                className="inline-flex items-center justify-center gap-2 bg-pink-600 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-pink-700 transition-colors"
              >
                Ver Catálogo
                <FiArrowRight />
              </Link>
              <Link
                href="/shop/catalog?category=Beachwear"
                className="inline-flex items-center justify-center gap-2 border-2 border-pink-600 text-pink-600 px-8 py-3.5 rounded-lg font-medium hover:bg-pink-50 transition-colors"
              >
                Beachwear
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-32 w-48 h-48 bg-rose-200/40 rounded-full blur-2xl" />
      </section>

      {/* Features */}
      <section className="bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                <FiSun className="text-pink-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Estampas Exclusivas
                </p>
                <p className="text-xs text-gray-500">Design autoral</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FiDroplet className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Tecidos Premium
                </p>
                <p className="text-xs text-gray-500">Conforto e durabilidade</p>
              </div>
            </div>
            <div className="flex items-center gap-4 justify-center sm:justify-end">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <FiStar className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  Acabamento Refinado
                </p>
                <p className="text-xs text-gray-500">Qualidade em cada detalhe</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Links */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Explore Nossas Categorias
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link
            href="/shop/catalog?category=Beachwear"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 p-8 text-white hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-2">Beachwear</h3>
            <p className="text-white/80 text-sm">
              Biquínis, body, maiôs e saídas de praia
            </p>
            <FiArrowRight className="absolute bottom-6 right-6 group-hover:translate-x-1 transition-transform" size={24} />
          </Link>
          <Link
            href="/shop/catalog?category=Outwear"
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 p-8 text-white hover:shadow-lg transition-shadow"
          >
            <h3 className="text-2xl font-bold mb-2">Outwear</h3>
            <p className="text-white/80 text-sm">
              Vestidos, saias, calças e muito mais
            </p>
            <FiArrowRight className="absolute bottom-6 right-6 group-hover:translate-x-1 transition-transform" size={24} />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Produtos em Destaque
          </h2>
          <Link
            href="/shop/catalog"
            className="text-sm font-medium text-pink-600 hover:text-pink-700 flex items-center gap-1"
          >
            Ver todos
            <FiArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
          </div>
        ) : featuredProducts.length > 0 ? (
          <ProductGrid products={featuredProducts} />
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">
              Nenhum produto em destaque ainda.
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Cadastre produtos e marque como destaque no painel admin.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

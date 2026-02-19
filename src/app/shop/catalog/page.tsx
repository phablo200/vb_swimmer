"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductGrid from "@/app/components/shop/ProductGrid";

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

interface CategoryFilter {
  _id: string;
  name: string;
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [categories, setCategories] = useState<CategoryFilter[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (category: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set("category", category);
      params.set("limit", "50");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-gray-500 mt-2">
          Explore nossa coleção completa de moda praia e outwear
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory("")}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === ""
              ? "bg-pink-600 text-white"
              : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600"
          }`}
        >
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.name
                ? "bg-pink-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-pink-300 hover:text-pink-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}

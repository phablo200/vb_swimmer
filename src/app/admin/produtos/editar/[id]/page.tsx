"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "@/app/components/admin/ProductForm";
import { IProduct } from "@/app/lib/models/Product";

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data.product);
        } else {
          setError(data.error || "Erro ao carregar produto");
        }
      } catch {
        setError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Editar Produto</h1>
        <p className="text-gray-500 mt-1">
          Atualize as informações do produto
        </p>
      </div>
      {product && <ProductForm product={product} />}
    </div>
  );
}

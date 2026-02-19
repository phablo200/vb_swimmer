"use client";

import ProductList from "@/app/components/admin/ProductList";

export default function ProdutosPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <p className="text-gray-500 mt-1">
          Gerencie todos os produtos da sua loja
        </p>
      </div>
      <ProductList />
    </div>
  );
}

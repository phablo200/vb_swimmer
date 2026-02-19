"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPackage, FiPlusCircle, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import Card from "@/app/components/ui/Card";

interface Stats {
  total: number;
  inStock: number;
  outOfStock: number;
  featured: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    featured: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/products?limit=1000");
      const data = await res.json();
      const products = data.products || [];

      setStats({
        total: products.length,
        inStock: products.filter((p: { inStock: boolean }) => p.inStock).length,
        outOfStock: products.filter((p: { inStock: boolean }) => !p.inStock).length,
        featured: products.filter((p: { featured: boolean }) => p.featured).length,
      });
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total de Produtos",
      value: stats.total,
      icon: FiPackage,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Em Estoque",
      value: stats.inStock,
      icon: FiTrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Sem Estoque",
      value: stats.outOfStock,
      icon: FiAlertCircle,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Destaques",
      value: stats.featured,
      icon: FiTrendingUp,
      color: "bg-pink-100 text-pink-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Visão geral da sua loja VB Swimwear
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/admin/produtos/novo"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <FiPlusCircle className="text-pink-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Adicionar Produto</p>
              <p className="text-sm text-gray-500">
                Cadastrar um novo produto na loja
              </p>
            </div>
          </Link>
          <Link
            href="/admin/produtos"
            className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-pink-300 hover:bg-pink-50 transition-colors"
          >
            <FiPackage className="text-pink-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">Gerenciar Produtos</p>
              <p className="text-sm text-gray-500">
                Ver, editar e remover produtos
              </p>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}

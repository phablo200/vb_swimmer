"use client";

import { useEffect, useState, useCallback } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiChevronUp,
  FiChevronDown,
  FiLayers,
} from "react-icons/fi";
import Button from "@/app/components/ui/Button";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  subcategories: string[];
  order: number;
  isActive: boolean;
}

interface CategoryFormData {
  name: string;
  description: string;
  subcategories: string[];
  order: string;
  isActive: boolean;
}

const emptyForm: CategoryFormData = {
  name: "",
  description: "",
  subcategories: [],
  order: "0",
  isActive: true,
};

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({ ...emptyForm });
  const [subcategoryInput, setSubcategoryInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories?all=true");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error("Erro ao carregar categorias");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAddSubcategory = () => {
    const value = subcategoryInput.trim();
    if (!value || formData.subcategories.includes(value)) return;
    setFormData({
      ...formData,
      subcategories: [...formData.subcategories, value],
    });
    setSubcategoryInput("");
  };

  const handleRemoveSubcategory = (sub: string) => {
    setFormData({
      ...formData,
      subcategories: formData.subcategories.filter((s) => s !== sub),
    });
  };

  const handleSubcategoryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSubcategory();
    }
  };

  const resetForm = () => {
    setFormData({ ...emptyForm });
    setSubcategoryInput("");
    setShowAddForm(false);
    setEditingId(null);
    setError("");
  };

  const startEditing = (cat: Category) => {
    setEditingId(cat._id);
    setShowAddForm(false);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      subcategories: [...cat.subcategories],
      order: cat.order.toString(),
      isActive: cat.isActive,
    });
    setSubcategoryInput("");
    setError("");
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("Nome da categoria é obrigatório");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        subcategories: formData.subcategories,
        order: parseInt(formData.order) || 0,
        isActive: formData.isActive,
      };

      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao salvar categoria");
        return;
      }

      resetForm();
      fetchCategories();
    } catch {
      setError("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erro ao excluir categoria");
        return;
      }

      fetchCategories();
    } catch {
      alert("Erro de conexão");
    } finally {
      setDeleting(null);
    }
  };

  const renderForm = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {editingId ? "Editar Categoria" : "Nova Categoria"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Beachwear"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordem
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descrição
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Descrição curta para exibir no catálogo"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Subcategorias
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={subcategoryInput}
            onChange={(e) => setSubcategoryInput(e.target.value)}
            onKeyDown={handleSubcategoryKeyDown}
            placeholder="Digite e pressione Enter"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleAddSubcategory}
            className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <FiPlus size={18} />
          </button>
        </div>
        {formData.subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.subcategories.map((sub) => (
              <span
                key={sub}
                className="inline-flex items-center gap-1 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm"
              >
                {sub}
                <button
                  type="button"
                  onClick={() => handleRemoveSubcategory(sub)}
                  className="hover:text-pink-900"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) =>
            setFormData({ ...formData, isActive: e.target.checked })
          }
          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="text-sm text-gray-700">
          Categoria ativa (visível na loja)
        </label>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Salvando..." : editingId ? "Atualizar" : "Criar"}
        </Button>
        <Button variant="outline" onClick={resetForm}>
          Cancelar
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-500 mt-1">
            Gerencie as categorias e subcategorias da loja
          </p>
        </div>
        {!showAddForm && !editingId && (
          <Button onClick={() => setShowAddForm(true)}>
            <FiPlus className="inline mr-1" size={16} />
            Nova Categoria
          </Button>
        )}
      </div>

      {(showAddForm || editingId) && renderForm()}

      {categories.length === 0 ? (
        <div className="text-center py-20">
          <FiLayers className="mx-auto text-gray-300" size={48} />
          <p className="text-gray-500 mt-4">
            Nenhuma categoria cadastrada ainda
          </p>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-block"
            >
              <Button>Cadastrar Primeira Categoria</Button>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ordem
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subcategorias
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr
                    key={cat._id}
                    className={`hover:bg-gray-50 transition-colors ${
                      !cat.isActive ? "opacity-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FiChevronUp
                          className="text-gray-400 cursor-pointer hover:text-gray-700"
                          size={14}
                        />
                        <span className="text-sm text-gray-600 w-6 text-center">
                          {cat.order}
                        </span>
                        <FiChevronDown
                          className="text-gray-400 cursor-pointer hover:text-gray-700"
                          size={14}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {cat.subcategories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cat.subcategories.map((sub) => (
                            <span
                              key={sub}
                              className="inline-flex px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                            >
                              {sub}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Nenhuma</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          cat.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <FiCheck size={12} /> Ativa
                          </>
                        ) : (
                          "Inativa"
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditing(cat)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          disabled={deleting === cat._id}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

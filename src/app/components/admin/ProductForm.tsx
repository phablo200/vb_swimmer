"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IProduct } from "@/app/lib/models/Product";
import Button from "@/app/components/ui/Button";
import Input from "@/app/components/ui/Input";
import Card from "@/app/components/ui/Card";
import RichTextEditor from "./RichTextEditor";
import ImageUpload from "./ImageUpload";
import { FiX, FiPlus } from "react-icons/fi";

interface ProductFormProps {
  product?: IProduct;
}

const CATEGORIES = [
  { value: "Beachwear", label: "Beachwear" },
  { value: "Outwear", label: "Outwear" },
];

const SUBCATEGORIES: Record<string, string[]> = {
  Beachwear: ["Biquínis", "Body/Maiô", "Saída de Praia"],
  Outwear: [
    "Vestidos",
    "Short e Saias",
    "Croppeds e Top",
    "Calças",
    "Blusas",
    "Macaquinhos",
    "Kimonos",
    "Sobreposição",
  ],
};

const SIZES = ["PP", "P", "M", "G", "GG", "XG"];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!product;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    compareAtPrice: product?.compareAtPrice?.toString() || "",
    discountPercent: product?.discountPercent?.toString() || "0",
    pixDiscountPercent: product?.pixDiscountPercent?.toString() || "10",
    images: product?.images || [],
    category: product?.category || "Beachwear",
    subcategory: product?.subcategory || "",
    colors: product?.colors || [],
    sizes: product?.sizes || [],
    composition: product?.composition || "",
    careInstructions: product?.careInstructions || [],
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    tags: product?.tags || [],
  });

  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });
  const [newTag, setNewTag] = useState("");
  const [newCareInstruction, setNewCareInstruction] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("admin_token");
      const url = isEditing
        ? `/api/products/${(product as IProduct & { _id: string })._id}`
        : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const body = {
        ...formData,
        price: parseFloat(formData.price),
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        discountPercent: parseInt(formData.discountPercent) || 0,
        pixDiscountPercent: parseInt(formData.pixDiscountPercent) || 10,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin/produtos");
      } else {
        setError(data.error || "Erro ao salvar produto");
      }
    } catch {
      setError("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  const addColor = () => {
    if (newColor.name.trim()) {
      setFormData({
        ...formData,
        colors: [...formData.colors, { ...newColor }],
      });
      setNewColor({ name: "", hex: "#000000" });
    }
  };

  const removeColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  const toggleSize = (size: string) => {
    const sizes = formData.sizes.includes(size)
      ? formData.sizes.filter((s) => s !== size)
      : [...formData.sizes, size];
    setFormData({ ...formData, sizes });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] });
      setNewTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((_, i) => i !== index),
    });
  };

  const addCareInstruction = () => {
    if (newCareInstruction.trim()) {
      setFormData({
        ...formData,
        careInstructions: [
          ...formData.careInstructions,
          newCareInstruction.trim(),
        ],
      });
      setNewCareInstruction("");
    }
  };

  const removeCareInstruction = (index: number) => {
    setFormData({
      ...formData,
      careInstructions: formData.careInstructions.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error}</div>
      )}

      {/* Basic Info */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informações Básicas
        </h2>
        <div className="space-y-4">
          <Input
            label="Nome do Produto"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ex: VESTIDO SERENA EYES | OFF"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subcategory: "",
                  })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Subcategoria
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) =>
                  setFormData({ ...formData, subcategory: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                {(SUBCATEGORIES[formData.category] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Descrição do Produto
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          Use o editor abaixo para formatar a descrição com títulos, negrito,
          listas e mais.
        </p>
        <RichTextEditor
          content={formData.description}
          onChange={(html) => setFormData({ ...formData, description: html })}
        />
      </Card>

      {/* Images */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Imagens do Produto
        </h2>
        <p className="text-sm text-gray-500 mb-3">
          A primeira imagem será usada como imagem principal.
        </p>
        <ImageUpload
          images={formData.images}
          onChange={(images) => setFormData({ ...formData, images })}
        />
      </Card>

      {/* Pricing */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Preços</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Preço (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="179.80"
            required
          />
          <Input
            label="Preço Comparativo (R$)"
            type="number"
            step="0.01"
            min="0"
            value={formData.compareAtPrice}
            onChange={(e) =>
              setFormData({ ...formData, compareAtPrice: e.target.value })
            }
            placeholder="Preço original"
            helperText="Opcional: preço antes do desconto"
          />
          <Input
            label="Desconto (%)"
            type="number"
            min="0"
            max="100"
            value={formData.discountPercent}
            onChange={(e) =>
              setFormData({ ...formData, discountPercent: e.target.value })
            }
            placeholder="0"
          />
          <Input
            label="Desconto Pix (%)"
            type="number"
            min="0"
            max="100"
            value={formData.pixDiscountPercent}
            onChange={(e) =>
              setFormData({ ...formData, pixDiscountPercent: e.target.value })
            }
            placeholder="10"
          />
        </div>
      </Card>

      {/* Colors */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cores</h2>
        <div className="flex items-end gap-3 mb-4">
          <Input
            label="Nome da Cor"
            value={newColor.name}
            onChange={(e) =>
              setNewColor({ ...newColor, name: e.target.value })
            }
            placeholder="Ex: OFF, PRETO, FLORAL"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cor
            </label>
            <input
              type="color"
              value={newColor.hex}
              onChange={(e) =>
                setNewColor({ ...newColor, hex: e.target.value })
              }
              className="h-[42px] w-16 rounded-lg border border-gray-300 cursor-pointer"
            />
          </div>
          <Button type="button" variant="outline" onClick={addColor}>
            <FiPlus size={18} />
          </Button>
        </div>

        {formData.colors.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.colors.map((color, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full text-sm"
              >
                <span
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.hex || "#000" }}
                />
                {color.name}
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Sizes */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tamanhos Disponíveis
        </h2>
        <div className="flex flex-wrap gap-3">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`w-14 h-14 rounded-lg font-medium text-sm transition-colors border-2 ${
                formData.sizes.includes(size)
                  ? "border-pink-600 bg-pink-50 text-pink-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </Card>

      {/* Composition & Care */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Composição e Cuidados
        </h2>
        <div className="space-y-4">
          <Input
            label="Composição do Tecido"
            value={formData.composition}
            onChange={(e) =>
              setFormData({ ...formData, composition: e.target.value })
            }
            placeholder="Ex: 98% Algodão | 2% Poliamida"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Cuidados com a Peça
            </label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCareInstruction}
                onChange={(e) => setNewCareInstruction(e.target.value)}
                placeholder="Ex: Lave à mão com sabão neutro"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCareInstruction();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCareInstruction}>
                <FiPlus size={18} />
              </Button>
            </div>
            {formData.careInstructions.length > 0 && (
              <ul className="space-y-1">
                {formData.careInstructions.map((instruction, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg text-sm"
                  >
                    <span>♥ {instruction}</span>
                    <button
                      type="button"
                      onClick={() => removeCareInstruction(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Card>

      {/* Tags */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
        <div className="flex gap-2 mb-3">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Adicionar tag..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <FiPlus size={18} />
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-pink-900"
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Status */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.inStock}
              onChange={(e) =>
                setFormData({ ...formData, inStock: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Em Estoque
              </span>
              <p className="text-xs text-gray-500">
                Produto disponível para venda
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) =>
                setFormData({ ...formData, featured: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">
                Destaque
              </span>
              <p className="text-xs text-gray-500">
                Exibir na página inicial da loja
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex items-center gap-4 pt-4">
        <Button type="submit" size="lg" loading={loading}>
          {isEditing ? "Salvar Alterações" : "Cadastrar Produto"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="lg"
          onClick={() => router.push("/admin/produtos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

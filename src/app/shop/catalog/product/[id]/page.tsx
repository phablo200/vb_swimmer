"use client";

import { useEffect, useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { FiChevronLeft, FiShoppingBag, FiTruck, FiShield, FiShoppingCart, FiCheck } from "react-icons/fi";
import ProductGrid from "@/app/components/shop/ProductGrid";
import { useCart } from "@/app/components/shop/CartProvider";

interface ProductColor {
  name: string;
  hex?: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  discountPercent: number;
  pixDiscountPercent: number;
  images: string[];
  category: string;
  subcategory?: string;
  colors: ProductColor[];
  sizes: string[];
  composition?: string;
  careInstructions: string[];
  inStock: boolean;
}

interface SimilarProduct {
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        const data = await res.json();

        if (res.ok) {
          setProduct(data.product);

          // Fetch similar products
          const similarRes = await fetch(
            `/api/products?category=${data.product.category}&limit=4`
          );
          const similarData = await similarRes.json();
          setSimilar(
            (similarData.products || []).filter(
              (p: SimilarProduct) => p._id !== data.product._id
            )
          );
        }
      } catch (error) {
        console.error("Erro ao carregar produto:", error);
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

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <FiShoppingBag className="mx-auto text-gray-300" size={64} />
        <h1 className="text-2xl font-bold text-gray-900 mt-6">
          Produto não encontrado
        </h1>
        <Link
          href="/shop/catalog"
          className="inline-flex items-center gap-2 mt-4 text-pink-600 hover:text-pink-700"
        >
          <FiChevronLeft />
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const pixPrice = product.price * (1 - product.pixDiscountPercent / 100);
  const installments = [1, 2, 3, 4];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/shop" className="hover:text-pink-600">
          Início
        </Link>
        <span>/</span>
        <Link href="/shop/catalog" className="hover:text-pink-600">
          Catálogo
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/shop/catalog?category=${product.category}`}
              className="hover:text-pink-600"
            >
              {product.category}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FiShoppingBag className="text-gray-300" size={64} />
              </div>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-white text-gray-900 px-6 py-2 rounded-full font-medium">
                  Esgotado
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === index
                      ? "border-pink-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - Imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Category breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>{product.category}</span>
            {product.subcategory && (
              <>
                <span>•</span>
                <span>{product.subcategory}</span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            {product.compareAtPrice &&
              product.compareAtPrice > product.price && (
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-sm text-gray-400 line-through">
                    R$ {product.compareAtPrice.toFixed(2).replace(".", ",")}
                  </span>
                  {product.discountPercent > 0 && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                      -{product.discountPercent}% OFF
                    </span>
                  )}
                </div>
              )}

            <p className="text-3xl font-bold text-gray-900">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>

            <p className="text-lg text-green-600 font-semibold mt-1">
              R$ {pixPrice.toFixed(2).replace(".", ",")} com Pix
            </p>
            <p className="text-xs text-green-500 mt-0.5">
              {product.pixDiscountPercent}% de desconto pagando com Pix
            </p>

            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-medium mb-1">
                Ou parcele em:
              </p>
              {installments.map((n) => (
                <p key={n} className="text-sm text-gray-500">
                  {n}x de R${" "}
                  {(product.price / n).toFixed(2).replace(".", ",")} sem juros
                </p>
              ))}
            </div>
          </div>

          {/* Colors */}
          {product.colors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Cor</h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedColor(color.name)}
                    className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg transition-colors ${
                      selectedColor === color.name
                        ? "border-pink-600 bg-pink-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex || "#000" }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Tamanho
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-lg font-medium text-sm transition-colors border-2 ${
                      selectedSize === size
                        ? "border-pink-600 bg-pink-50 text-pink-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="mb-6">
            {product.sizes.length > 0 && !selectedSize && (
              <p className="text-sm text-amber-600 mb-2">
                Selecione um tamanho para continuar
              </p>
            )}
            <button
              onClick={async () => {
                if (product.sizes.length > 0 && !selectedSize) return;
                setAddingToCart(true);
                const success = await addToCart({
                  productId: product._id,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] || "",
                  size: selectedSize,
                  color: selectedColor || (product.colors[0]?.name ?? ""),
                  quantity: 1,
                });
                setAddingToCart(false);
                if (success) {
                  setAddedToCart(true);
                  setTimeout(() => setAddedToCart(false), 3000);
                }
              }}
              disabled={
                !product.inStock ||
                addingToCart ||
                (product.sizes.length > 0 && !selectedSize)
              }
              className={`w-full py-4 rounded-xl font-semibold text-base transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : product.inStock
                  ? "bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {addingToCart ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Adicionando...
                </>
              ) : addedToCart ? (
                <>
                  <FiCheck size={20} />
                  Adicionado ao Carrinho!
                </>
              ) : !product.inStock ? (
                "Produto Esgotado"
              ) : (
                <>
                  <FiShoppingCart size={20} />
                  Adicionar ao Carrinho
                </>
              )}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FiTruck className="text-pink-600" size={18} />
              <span className="text-xs text-gray-600">
                Frete grátis acima de R$299
              </span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <FiShield className="text-pink-600" size={18} />
              <span className="text-xs text-gray-600">
                Compra 100% segura
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12 max-w-4xl">
          <div className="border-t border-gray-200 pt-8">
            <div
              className="prose prose-pink max-w-none prose-headings:text-pink-700 prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-600 prose-strong:text-gray-900 prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        </div>
      )}

      {/* Composition & Care */}
      {(product.composition || product.careInstructions.length > 0) && (
        <div className="mt-8 max-w-4xl">
          <div className="border-t border-gray-200 pt-8">
            {product.composition && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-pink-700 mb-2">
                  Composição do Tecido
                </h3>
                <p className="text-gray-600">{product.composition}</p>
              </div>
            )}

            {product.careInstructions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-pink-700 mb-2">
                  Cuidados com sua Peça
                </h3>
                <ul className="space-y-1">
                  {product.careInstructions.map((instruction, index) => (
                    <li key={index} className="text-gray-600">
                      ♥ {instruction}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Similar Products */}
      {similar.length > 0 && (
        <div className="mt-16">
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Produtos Similares
            </h2>
            <ProductGrid products={similar} />
          </div>
        </div>
      )}
    </div>
  );
}

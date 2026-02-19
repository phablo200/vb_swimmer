import Image from "next/image";
import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    compareAtPrice?: number;
    discountPercent: number;
    pixDiscountPercent: number;
    images: string[];
    inStock: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const pixPrice = product.price * (1 - product.pixDiscountPercent / 100);
  const installmentPrice = (product.price / 4).toFixed(2).replace(".", ",");

  return (
    <Link
      href={`/shop/catalog/product/${product.slug}`}
      className="group block"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiShoppingBag className="text-gray-300" size={48} />
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {!product.inStock && (
              <span className="px-2.5 py-1 bg-gray-900/80 text-white text-xs font-medium rounded-full">
                Esgotado
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          {product.inStock && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-green-500/90 text-white text-xs font-medium rounded-full">
              Frete grátis
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
            {product.name}
          </h3>

          <div className="space-y-1">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <p className="text-xs text-gray-400 line-through">
                R$ {product.compareAtPrice.toFixed(2).replace(".", ",")}
              </p>
            )}

            <p className="text-lg font-bold text-gray-900">
              R$ {product.price.toFixed(2).replace(".", ",")}
            </p>

            <p className="text-sm text-green-600 font-medium">
              R$ {pixPrice.toFixed(2).replace(".", ",")} com Pix
            </p>

            <p className="text-xs text-gray-500">
              4x de R$ {installmentPrice} sem juros
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductColor {
  name: string;
  hex?: string;
}

export interface IProduct extends Document {
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
  colors: IProductColor[];
  sizes: string[];
  composition?: string;
  careInstructions: string[];
  inStock: boolean;
  featured: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true },
    hex: { type: String },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Nome do produto é obrigatório"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Descrição do produto é obrigatória"],
    },
    price: {
      type: Number,
      required: [true, "Preço do produto é obrigatório"],
      min: [0, "Preço não pode ser negativo"],
    },
    compareAtPrice: {
      type: Number,
      min: [0, "Preço comparativo não pode ser negativo"],
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    pixDiscountPercent: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },
    images: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, "Categoria é obrigatória"],
      enum: ["Beachwear", "Outwear"],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    colors: {
      type: [ProductColorSchema],
      default: [],
    },
    sizes: {
      type: [String],
      default: [],
      enum: ["PP", "P", "M", "G", "GG", "XG"],
    },
    composition: {
      type: String,
      trim: true,
    },
    careInstructions: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({ category: 1, subcategory: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ name: "text", tags: "text" });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

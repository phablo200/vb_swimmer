import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: IOrderItem[];
  subtotal: number;
  notes?: string;
  status: "pendente" | "confirmado" | "enviado" | "entregue" | "cancelado";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    size: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, "Nome do cliente é obrigatório"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Telefone do cliente é obrigatório"],
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: "O pedido deve conter ao menos um item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pendente", "confirmado", "enviado", "entregue", "cancelado"],
      default: "pendente",
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export function generateOrderNumber(): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `VB-${timestamp}-${random}`;
}

const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;

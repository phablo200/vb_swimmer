import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Cart from "@/app/lib/models/Cart";
import Order, { generateOrderNumber } from "@/app/lib/models/Order";
import { getSessionId } from "@/app/lib/session";

function formatCurrency(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

function buildWhatsAppMessage(order: {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: {
    name: string;
    size: string;
    color: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  notes?: string;
}): string {
  const appName = process.env.NEXT_PUBLIC_APP_NAME || "VB Swimwear";
  let message = `*Novo Pedido - ${appName}*\n`;
  message += `Pedido: #${order.orderNumber}\n\n`;
  message += `*Cliente:* ${order.customerName}\n`;
  message += `*Telefone:* ${order.customerPhone}\n`;

  if (order.customerEmail) {
    message += `*Email:* ${order.customerEmail}\n`;
  }

  message += `\n*Itens:*\n`;

  order.items.forEach((item) => {
    const details = [];
    if (item.size) details.push(`Tam: ${item.size}`);
    if (item.color) details.push(`Cor: ${item.color}`);
    const detailStr = details.length > 0 ? ` - ${details.join(" | ")}` : "";

    message += `${item.quantity}x ${item.name}${detailStr} - R$ ${formatCurrency(item.price * item.quantity)}\n`;
  });

  message += `\n*Subtotal:* R$ ${formatCurrency(order.subtotal)}`;

  const pixDiscount = order.subtotal * 0.9;
  message += `\n*Com Pix (10% off):* R$ ${formatCurrency(pixDiscount)}`;

  if (order.notes) {
    message += `\n\n*Observações:* ${order.notes}`;
  }

  return message;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = await getSessionId();
    const { customerName, customerPhone, customerEmail, notes } =
      await request.json();

    if (!customerName || !customerPhone) {
      return NextResponse.json(
        { error: "Nome e telefone são obrigatórios" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ sessionId });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Carrinho está vazio" },
        { status: 400 }
      );
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      items: cart.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        image: item.image,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      subtotal,
      notes: notes || undefined,
      status: "pendente",
    });

    const whatsappNumber = process.env.WHATSAPP_NUMBER || "5571991426930";
    const message = buildWhatsAppMessage({
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      items: cart.items,
      subtotal,
      notes,
    });

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Clear the cart after order is placed
    cart.items = [];
    await cart.save();

    return NextResponse.json({
      order: {
        _id: order._id,
        orderNumber: order.orderNumber,
        subtotal: order.subtotal,
      },
      whatsappUrl,
      message: "Pedido realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    return NextResponse.json(
      { error: "Erro ao finalizar pedido" },
      { status: 500 }
    );
  }
}

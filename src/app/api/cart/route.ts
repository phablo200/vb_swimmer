import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Cart from "@/app/lib/models/Cart";
import { getSessionId } from "@/app/lib/session";

export async function GET() {
  try {
    await dbConnect();
    const sessionId = await getSessionId();

    const cart = await Cart.findOne({ sessionId }).lean();

    return NextResponse.json({
      cart: cart || { sessionId, items: [] },
      itemCount: cart
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0,
    });
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao buscar carrinho" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = await getSessionId();
    const { productId, name, price, image, size, color, quantity } =
      await request.json();

    if (!productId || !name || !price) {
      return NextResponse.json(
        { error: "Dados do produto são obrigatórios" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ sessionId });

    if (!cart) {
      cart = new Cart({ sessionId, items: [] });
    }

    const existingIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === (size || "") &&
        item.color === (color || "")
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        productId,
        name,
        price,
        image: image || "",
        size: size || "",
        color: color || "",
        quantity: quantity || 1,
      });
    }

    await cart.save();

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart,
      itemCount,
      message: "Produto adicionado ao carrinho",
    });
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao adicionar ao carrinho" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = await getSessionId();
    const { productId, size, color, quantity } = await request.json();

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return NextResponse.json(
        { error: "Carrinho não encontrado" },
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === (size || "") &&
        item.color === (color || "")
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: "Item não encontrado no carrinho" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart,
      itemCount,
      message: "Carrinho atualizado",
    });
  } catch (error) {
    console.error("Erro ao atualizar carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar carrinho" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const sessionId = await getSessionId();
    const { productId, size, color } = await request.json();

    const cart = await Cart.findOne({ sessionId });

    if (!cart) {
      return NextResponse.json(
        { error: "Carrinho não encontrado" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter(
      (item) =>
        !(
          item.productId.toString() === productId &&
          item.size === (size || "") &&
          item.color === (color || "")
        )
    );

    await cart.save();

    const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart,
      itemCount,
      message: "Item removido do carrinho",
    });
  } catch (error) {
    console.error("Erro ao remover do carrinho:", error);
    return NextResponse.json(
      { error: "Erro ao remover do carrinho" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/app/lib/mongodb";
import Product from "@/app/lib/models/Product";
import { isAuthenticated } from "@/app/lib/auth";
import slugify from "slugify";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await dbConnect();
    const { id } = await context.params;

    let product;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).lean();
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await context.params;
    const body = await request.json();

    if (body.name) {
      const newSlug = slugify(body.name, { lower: true, strict: true });
      const existingProduct = await Product.findOne({
        slug: newSlug,
        _id: { $ne: id },
      });
      body.slug = existingProduct ? `${newSlug}-${Date.now()}` : newSlug;
    }

    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product,
      message: "Produto atualizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();
    const { id } = await context.params;

    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Produto removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover produto:", error);
    return NextResponse.json(
      { error: "Erro ao remover produto" },
      { status: 500 }
    );
  }
}

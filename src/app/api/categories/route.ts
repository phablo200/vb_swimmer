import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Category from "@/app/lib/models/Category";
import { isAuthenticated } from "@/app/lib/auth";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all");

    const filter = all === "true" ? {} : { isActive: true };

    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erro ao buscar categorias:", error);
    return NextResponse.json(
      { error: "Erro ao buscar categorias" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();

    const slug = slugify(body.name, { lower: true, strict: true, locale: "pt" });

    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe uma categoria com esse nome" },
        { status: 409 }
      );
    }

    const category = await Category.create({
      ...body,
      slug,
    });

    return NextResponse.json(
      { category, message: "Categoria criada com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar categoria" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Category from "@/app/lib/models/Category";
import Product from "@/app/lib/models/Product";
import { isAuthenticated } from "@/app/lib/auth";
import slugify from "slugify";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    if (body.name) {
      body.slug = slugify(body.name, { lower: true, strict: true, locale: "pt" });

      const existing = await Category.findOne({
        slug: body.slug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Já existe uma categoria com esse nome" },
          { status: 409 }
        );
      }
    }

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category,
      message: "Categoria atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar categoria" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const { id } = await params;

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Categoria não encontrada" },
        { status: 404 }
      );
    }

    const productCount = await Product.countDocuments({
      category: category.name,
    });

    if (productCount > 0) {
      return NextResponse.json(
        {
          error: `Não é possível excluir: ${productCount} produto(s) utilizam esta categoria. Reatribua-os antes de excluir.`,
        },
        { status: 409 }
      );
    }

    await Category.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Categoria excluída com sucesso",
    });
  } catch (error) {
    console.error("Erro ao excluir categoria:", error);
    return NextResponse.json(
      { error: "Erro ao excluir categoria" },
      { status: 500 }
    );
  }
}

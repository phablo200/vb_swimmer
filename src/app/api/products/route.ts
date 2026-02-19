import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Product from "@/app/lib/models/Product";
import { isAuthenticated } from "@/app/lib/auth";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (category) {
      filter.category = category;
    }

    if (featured === "true") {
      filter.featured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
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

    const slug = slugify(body.name, { lower: true, strict: true });

    const existingProduct = await Product.findOne({ slug });
    const finalSlug = existingProduct ? `${slug}-${Date.now()}` : slug;

    const product = await Product.create({
      ...body,
      slug: finalSlug,
    });

    return NextResponse.json(
      { product, message: "Produto criado com sucesso" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

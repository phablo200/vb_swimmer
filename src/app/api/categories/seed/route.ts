import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import Category from "@/app/lib/models/Category";
import { isAuthenticated } from "@/app/lib/auth";

const SEED_DATA = [
  {
    name: "Beachwear",
    slug: "beachwear",
    description: "Biquínis, body, maiôs e saídas de praia",
    subcategories: ["Biquínis", "Body/Maiô", "Saída de Praia"],
    order: 0,
    isActive: true,
  },
  {
    name: "Outwear",
    slug: "outwear",
    description: "Vestidos, saias, calças e muito mais",
    subcategories: [
      "Vestidos",
      "Short e Saias",
      "Croppeds e Top",
      "Calças",
      "Blusas",
      "Macaquinhos",
      "Kimonos",
      "Sobreposição",
    ],
    order: 1,
    isActive: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const existing = await Category.countDocuments();
    if (existing > 0) {
      return NextResponse.json(
        {
          message: `Seed ignorado: já existem ${existing} categoria(s) cadastrada(s).`,
          seeded: false,
        },
        { status: 200 }
      );
    }

    const created = await Category.insertMany(SEED_DATA);

    return NextResponse.json(
      {
        message: `${created.length} categoria(s) criada(s) com sucesso.`,
        categories: created,
        seeded: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao semear categorias:", error);
    return NextResponse.json(
      { error: "Erro ao semear categorias" },
      { status: 500 }
    );
  }
}

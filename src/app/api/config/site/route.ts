import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/app/lib/mongodb";
import SiteConfig from "@/app/lib/models/SiteConfig";
import { isAuthenticated } from "@/app/lib/auth";

async function getOrCreateConfig() {
  let config = await SiteConfig.findOne();
  if (!config) {
    config = await SiteConfig.create({
      announcementEnabled: true,
      freeShippingMinValue: 299,
    });
  }
  return config;
}

export async function GET() {
  try {
    await dbConnect();
    const config = await getOrCreateConfig();
    return NextResponse.json({ config });
  } catch (error) {
    console.error("Erro ao buscar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    const config = await getOrCreateConfig();

    if (typeof body.announcementEnabled === "boolean") {
      config.announcementEnabled = body.announcementEnabled;
    }
    if (typeof body.freeShippingMinValue === "number") {
      config.freeShippingMinValue = body.freeShippingMinValue;
    }

    await config.save();

    return NextResponse.json({
      config,
      message: "Configurações atualizadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar configurações:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações" },
      { status: 500 }
    );
  }
}

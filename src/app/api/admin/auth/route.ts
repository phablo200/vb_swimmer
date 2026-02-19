import { NextRequest, NextResponse } from "next/server";
import { generateToken } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Configuração do servidor inválida" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "Senha incorreta" },
        { status: 401 }
      );
    }

    const token = generateToken();

    return NextResponse.json({
      success: true,
      token,
      message: "Login realizado com sucesso",
    });
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar requisição" },
      { status: 400 }
    );
  }
}

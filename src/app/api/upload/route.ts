import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import { isAuthenticated } from "@/app/lib/auth";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthenticated(request)) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    const uploadedPaths: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".jpg";
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}-${randomSuffix}${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "images", "products");
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      uploadedPaths.push(`/images/products/${fileName}`);
    }

    return NextResponse.json({
      paths: uploadedPaths,
      message: `${uploadedPaths.length} arquivo(s) enviado(s) com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return NextResponse.json(
      { error: "Erro ao fazer upload dos arquivos" },
      { status: 500 }
    );
  }
}

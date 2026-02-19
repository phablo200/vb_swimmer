import { NextResponse } from "next/server";

export async function GET() {
  const whatsappNumber = process.env.WHATSAPP_NUMBER || "";

  return NextResponse.json({
    number: whatsappNumber,
  });
}

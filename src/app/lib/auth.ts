import { NextRequest } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

export function generateToken(): string {
  const payload = `${ADMIN_PASSWORD}:${Date.now()}`;
  return Buffer.from(payload).toString("base64");
}

export function validateToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [password] = decoded.split(":");
    return password === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export function isAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.replace("Bearer ", "");
  return validateToken(token);
}

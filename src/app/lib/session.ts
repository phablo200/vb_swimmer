import { cookies } from "next/headers";

const CART_SESSION_COOKIE = "cart_session_id";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(CART_SESSION_COOKIE);

  if (existing?.value) {
    return existing.value;
  }

  const newSessionId = crypto.randomUUID();
  cookieStore.set(CART_SESSION_COOKIE, newSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  return newSessionId;
}

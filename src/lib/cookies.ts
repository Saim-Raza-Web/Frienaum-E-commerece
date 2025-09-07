import { serialize, parse } from "cookie";

export function setAuthCookie(token: string) {
  return serialize("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function clearAuthCookie() {
  return serialize("token", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function readCookies(cookieHeader?: string) {
  return parse(cookieHeader || "");
}

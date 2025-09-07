import { GetServerSidePropsContext } from "next";
import { readCookies } from "./cookies";
import { verifyToken } from "./auth";

export function requireRole(ctx: GetServerSidePropsContext, allowed: Array<"ADMIN"|"MERCHANT"|"CUSTOMER">) {
  try {
    const cookies = readCookies(ctx.req.headers.cookie);
    const token = cookies.token;
    if (!token) return { redirect: { destination: "/login", permanent: false } };

    const payload = verifyToken(token);
    if (!allowed.includes(payload.role)) {
      return { redirect: { destination: "/login", permanent: false } };
    }
    return { props: { user: payload } };
  } catch {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

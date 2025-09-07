import type { NextApiRequest } from "next";
import { readCookies } from "./cookies";
import { verifyToken } from "./auth";

export function getUserFromReq(req: NextApiRequest) {
  const cookies = readCookies(req.headers.cookie);
  const token = cookies.token;
  if (!token) return null;
  try {
    return verifyToken(token); // { id, email, role }
  } catch {
    return null;
  }
}

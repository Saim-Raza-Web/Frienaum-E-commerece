import type { NextApiRequest, NextApiResponse } from "next";
import { clearAuthCookie } from "../../../lib/cookies";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });
  res.setHeader("Set-Cookie", clearAuthCookie());
  return res.status(200).json({ ok: true });
}

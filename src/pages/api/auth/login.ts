import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../../../lib/auth";
import { setAuthCookie } from "../../../lib/cookies";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.setHeader("Set-Cookie", setAuthCookie(token));

  return res.status(200).json({ role: user.role, name: user.name });
}

import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

const JWT_SECRET = process.env.JWT_SECRET!;

export type JWTPayload = {
  id: string;
  email: string;
  role: "ADMIN" | "MERCHANT" | "CUSTOMER";
};

export function signToken(user: Pick<User, "id" | "email" | "role">) {
  return jwt.sign(
    { id: String(user.id), email: user.email, role: user.role } as JWTPayload,
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

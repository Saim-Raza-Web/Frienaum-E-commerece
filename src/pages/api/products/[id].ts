import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getUserFromReq } from "../../../lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (Number.isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  if (req.method === "GET") {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(product);
  }

  if (req.method === "PUT") {
    const user = getUserFromReq(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl } = req.body;
    const updated = await prisma.product.update({
      where: { id },
      data: { slug, title_en, title_de, desc_en, desc_de, price: Number(price), stock: Number(stock), imageUrl }
    });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    const user = getUserFromReq(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await prisma.product.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ message: "Method not allowed" });
}

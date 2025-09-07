import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { getUserFromReq } from "../../../lib/apiAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const user = getUserFromReq(req);
    if (!user || (user.role !== "ADMIN" && user.role !== "MERCHANT")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { slug, title_en, title_de, desc_en, desc_de, price, stock, imageUrl, category } = req.body;
    try {
      const created = await prisma.product.create({
        data: { slug, title_en, title_de, desc_en, desc_de, price: Number(price), stock: Number(stock), imageUrl, category }
      });
      return res.status(201).json(created);
    } catch (e:any) {
      return res.status(400).json({ message: e?.meta?.cause || "Bad request" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}

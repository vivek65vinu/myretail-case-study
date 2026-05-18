import { Request, Response } from "express";
import * as productService from "../services/productService";

// Controller layer — handles HTTP req/res and delegates all logic to the service

export const getProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await productService.getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { price, currency_code } = req.body;

    const updated = await productService.updateProductPrice(id, price, currency_code);

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

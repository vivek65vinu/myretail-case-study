import { Request, Response } from "express";
import * as productService from "../services/productService";

// Controller layer — handles HTTP req/res and delegates all logic to the service

export async function getProduct(req: Request, res: Response) {
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
}

export async function updateProduct(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const { value, currency_code } = req.body.current_price;

    const updated = await productService.updateProductPrice(id, value, currency_code);
    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

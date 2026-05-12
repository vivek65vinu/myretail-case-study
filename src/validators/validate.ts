import { Request, Response, NextFunction } from "express";

// Validates :id param is a positive integer
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);

  if (!req.params.id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid id: must be a positive integer" });
  }

  next();
};

// Validates PUT body has a valid price and currency_code
export const validateUpdateBody = (req: Request, res: Response, next: NextFunction) => {
  const { price, currency_code } = req.body;

  if (price === undefined || price === null) {
    return res.status(400).json({ error: "Missing required field: price" });
  }

  if (typeof price !== "number" || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: "Invalid price: must be a positive number" });
  }

  if (!currency_code || typeof currency_code !== "string" || currency_code.trim() === "") {
    return res.status(400).json({ error: "Missing required field: currency_code" });
  }

  next();
};

import express from "express";
import Product from "../model/Product";
import { getProductName } from "../client/redskyClient";

const router = express.Router();

// GET /products/:id
// Aggregates pricing from MongoDB with the product name from the Redsky API
// and returns a single unified response to the client.
router.get("/:id", async (req, res) => {

  try {
    const id = Number(req.params.id);

    // Look up pricing data stored internally — source of truth for price
    const product = await Product.findOne({
      _id: id
    });

    if (!product) {
      return res.status(404).json({
        error: "Product price not found"
      });
    }

    // Fetch the human-readable product name from Target's external Redsky API
    const name = await getProductName(req.params.id);

    // Merge internal price data with the external product name
    res.json({
      id,
      name,
      current_price: {
        value: product.value,
        currency_code: product.currency_code
      }
    });

  } catch (err: any) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });
  }
});

// PUT /products/:id
// Allows updating the price and currency for a product stored in MongoDB.
// Only price data is mutable here — product names live in the external Redsky API.
router.put("/:id", async (req, res) => {

  try {
    const id = Number(req.params.id);

    // findOneAndUpdate with { new: true } returns the updated document, not the original
    const updatedProduct =
      await Product.findOneAndUpdate(
        { _id: id },
        {
          value: req.body.current_price.value,
          currency_code:
            req.body.current_price.currency_code
        },
        { new: true }
      );

    res.json(updatedProduct);
  } catch (err: any) {

    res.status(500).json({
      error: err.message
    });
  }
});

export default router;

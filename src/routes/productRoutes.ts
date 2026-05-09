import express from "express";
import Product from "../model/Product";
import { getProductName } from "../client/redskyClient";

const router = express.Router();

router.get("/:id", async (req, res) => {

  try {
    const id = Number(req.params.id);
    const product = await Product.findOne({
      _id: id
    });

    if (!product) {

      return res.status(404).json({
        error: "Product price not found"
      });
    }

    const name = await getProductName(
      req.params.id
    );

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

router.put("/:id", async (req, res) => {

  try {
    const id = Number(req.params.id);
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
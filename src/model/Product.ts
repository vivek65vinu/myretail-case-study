import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    _id: Number,
    value: Number,
    currency_code: String
  },
  {
    versionKey: false
  }
);

export default mongoose.model(
  "ProductPrice",
  ProductSchema,
  "product_prices"
);
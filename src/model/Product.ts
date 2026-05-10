import mongoose from "mongoose";

// Schema for the `product_prices` MongoDB collection.
// Stores only pricing data — product names come from the Redsky API at request time.
const ProductSchema = new mongoose.Schema(
  {
    // Using the product's numeric ID as _id avoids a separate lookup index
    _id: Number,
    value: Number,
    currency_code: String
  },
  {
    // Disable the __v field Mongoose adds by default — not needed here
    versionKey: false
  }
);

export default mongoose.model(
  "ProductPrice",
  ProductSchema,
  "product_prices" // explicit collection name so Mongoose doesn't auto-pluralize
);

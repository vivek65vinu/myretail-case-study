import mongoose from "mongoose";

// Shape of a document in the product_prices collection
export interface IProduct {
  _id: number;
  value: number;
  currency_code: string;
}

// Schema for the `product_prices` MongoDB collection.
// Stores only pricing data — product names come from the Redsky API at request time.
const ProductSchema = new mongoose.Schema<IProduct>(
  {
    // Using the product's numeric ID as _id avoids a separate lookup index
    _id: { type: Number, required: true },
    value: { type: Number, required: true },
    currency_code: { type: String, required: true }
  },
  {
    // Disable the __v field Mongoose adds by default — not needed here
    versionKey: false
  }
);

export default mongoose.model<IProduct>(
  "ProductPrice",
  ProductSchema,
  "product_prices" // explicit collection name so Mongoose doesn't auto-pluralize
);

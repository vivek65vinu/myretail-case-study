import Product from "../model/Product";
import { fetchProductTitle } from "../client/redskyClient";

// Business logic layer — orchestrates data from MongoDB and the Redsky API

export async function getProductById(id: number) {
  const product = await Product.findOne({ _id: id });

  if (!product) return null;

  // Aggregate internal price data with external product name in parallel
  const name = await fetchProductTitle(String(id));

  return {
    id,
    name,
    current_price: {
      value: product.value,
      currency_code: product.currency_code
    }
  };
}

export async function updateProductPrice(
  id: number,
  value: number,
  currency_code: string
) {
  return Product.findOneAndUpdate(
    { _id: id },
    { value, currency_code },
    { new: true } // return the updated document, not the original
  );
}

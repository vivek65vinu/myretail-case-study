import Product, { IProduct } from "../model/Product";
import { fetchProductTitle } from "../client/redskyClient";

// Shape of the aggregated response returned to the client
export interface ProductResponse {
  id: number;
  name: string;
  current_price: {
    value: number;
    currency_code: string;
  };
}

// Business logic layer — orchestrates data from MongoDB and the Redsky API

export async function getProductById(id: number): Promise<ProductResponse | null> {
  const product = await Product.findOne({ _id: id });

  if (!product) return null;

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
): Promise<IProduct | null> {
  return Product.findOneAndUpdate(
    { _id: id },
    { value, currency_code },
    { new: true } // return the updated document, not the original
  );
}

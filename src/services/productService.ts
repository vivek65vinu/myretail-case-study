import Product, { IProduct } from "../model/Product";
import { fetchProductData } from "../client/redskyClient";

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

const extractProductName = (data: any): string =>
  data?.data?.product?.item?.product_description?.title ||
  data?.data?.product?.item?.enrichment?.buy_url ||
  "Product Name Not Found";

export const getProductById = async (id: number): Promise<ProductResponse | null> => {
  // Fire both calls at the same time instead of waiting for MongoDB before calling Redsky
  const [product, redskyData] = await Promise.all([
    Product.findOne({ _id: id }),
    fetchProductData(String(id))
  ]);

  if (!product) return null;

  return {
    id,
    name: extractProductName(redskyData),
    current_price: {
      value: product.value,
      currency_code: product.currency_code
    }
  };
};

export const updateProductPrice = async (
  id: number,
  price: number,
  currency_code: string
): Promise<IProduct | null> =>
  Product.findOneAndUpdate(
    { _id: id },
    { value: price, currency_code },
    { new: true } // return the updated document, not the original
  );

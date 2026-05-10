import axios from "axios";
import dotenv from "dotenv";

// Ensure env vars are loaded when this module is used independently (e.g. in tests)
dotenv.config();

// Fetches the product title from Target's external Redsky API by product ID (tcin).
// Returns the title, falls back to the buy URL, or a placeholder if neither exists.
export async function getProductName(id: string) {

  // Base URL and API key are kept in .env to avoid hardcoding credentials in source
  const url =
    `${process.env.REDSKY_TARGET_URL}` +
    `?key=${process.env.KEY}` +
    `&tcin=${id}`;

  const response = await axios.get(url, {
    headers: {
      // Redsky requires a browser-like User-Agent; requests without it are rejected
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  console.log(
    JSON.stringify(response.data, null, 2)
  );

  // Prefer the product title; fall back to buy_url if title is missing
  return (
    response.data?.data?.product?.item?.
      product_description?.title
    ||
    response.data?.data?.product?.
      item?.enrichment?.buy_url
    ||
    "Product Name Not Found"
  );
}

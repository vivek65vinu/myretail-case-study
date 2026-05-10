import axios from "axios";
import { env } from "../config/env";

// Pure HTTP client — only responsibility is fetching data from the Redsky API
export async function fetchProductTitle(id: string): Promise<string> {
  const url = `${env.REDSKY_TARGET_URL}?key=${env.REDSKY_KEY}&tcin=${id}`;

  const { data } = await axios.get(url, {
    headers: {
      // Redsky rejects requests without a browser-like User-Agent
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
  });

  return (
    data?.data?.product?.item?.product_description?.title ||
    data?.data?.product?.item?.enrichment?.buy_url ||
    "Product Name Not Found"
  );
}

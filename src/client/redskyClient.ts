import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const REDSKY_URL = process.env.REDSKY_TARGET_URL!;
const REDSKY_KEY = process.env.KEY!;

// Pure HTTP client — only responsibility is fetching data from the Redsky API
export async function fetchProductTitle(id: string): Promise<string> {
  const url = `${REDSKY_URL}?key=${REDSKY_KEY}&tcin=${id}`;

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

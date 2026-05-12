import axios from "axios";

// Pure HTTP client — fetches raw product data from the Redsky API
export const fetchProductData = async (id: string): Promise<any> => {
  const url = `${process.env.REDSKY_TARGET_URL}?key=${process.env.KEY}&tcin=${id}`;

  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "myRetail-API/1.0.0"
    }
  });

  return data;
};

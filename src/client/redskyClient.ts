import axios from "axios";

export async function getProductName(id: string) {

  const url =
    `https://redsky.target.com/redsky_aggregations/v1/redsky/case_study_v1` +
    `?key=9f36aeafbe60771e321a7cc95a78140772ab3e96` +
    `&tcin=${id}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });

  console.log(
    JSON.stringify(response.data, null, 2)
  );

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
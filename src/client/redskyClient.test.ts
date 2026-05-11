import axios from "axios";
import { fetchProductTitle } from "./redskyClient";

// Mock axios so no real HTTP calls are made
jest.mock("axios");

// Mock env config so tests don't require a .env file
jest.mock("../config/env", () => ({
  env: {
    REDSKY_TARGET_URL: "https://redsky.example.com",
    REDSKY_KEY: "test-key"
  }
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("redskyClient — fetchProductTitle", () => {

  afterEach(() => jest.clearAllMocks());

  it("returns the product title when present in the API response", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          product: {
            item: {
              product_description: { title: "The Big Lebowski (Blu-ray)" }
            }
          }
        }
      }
    });

    const title = await fetchProductTitle("13860428");
    expect(title).toBe("The Big Lebowski (Blu-ray)");
  });

  it("falls back to buy_url when product title is missing", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        data: {
          product: {
            item: {
              product_description: {},
              enrichment: { buy_url: "https://www.target.com/p/-/A-13860428" }
            }
          }
        }
      }
    });

    const title = await fetchProductTitle("13860428");
    expect(title).toBe("https://www.target.com/p/-/A-13860428");
  });

  it("returns placeholder string when both title and buy_url are missing", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { product: { item: {} } } }
    });

    const title = await fetchProductTitle("13860428");
    expect(title).toBe("Product Name Not Found");
  });

  it("builds the correct request URL with product id and api key", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { product: { item: { product_description: { title: "Test" } } } } }
    });

    await fetchProductTitle("13860428");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://redsky.example.com?key=test-key&tcin=13860428",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("throws when the axios call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    await expect(fetchProductTitle("13860428")).rejects.toThrow("Network Error");
  });
});

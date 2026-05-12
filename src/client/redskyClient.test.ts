import axios from "axios";
import { fetchProductData } from "./redskyClient";

// Mock axios so no real HTTP calls are made
jest.mock("axios");

// Set env vars directly so tests don't require a .env file
process.env.REDSKY_TARGET_URL = "https://redsky.example.com";
process.env.KEY = "test-key";

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockRedskyResponse = (item: object) => ({
  data: { data: { product: { item } } }
});

describe("redskyClient — fetchProductData", () => {

  afterEach(() => jest.clearAllMocks());

  it("returns raw data from the Redsky API", async () => {
    const item = { product_description: { title: "The Big Lebowski (Blu-ray)" } };
    mockedAxios.get.mockResolvedValue(mockRedskyResponse(item));

    const data = await fetchProductData("13860428");

    expect(data).toEqual(mockRedskyResponse(item).data);
  });

  it("builds the correct request URL with product id and api key", async () => {
    mockedAxios.get.mockResolvedValue(mockRedskyResponse({}));

    await fetchProductData("13860428");

    expect(mockedAxios.get).toHaveBeenCalledWith(
      "https://redsky.example.com?key=test-key&tcin=13860428",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("throws when the axios call fails", async () => {
    mockedAxios.get.mockRejectedValue(new Error("Network Error"));

    await expect(fetchProductData("13860428")).rejects.toThrow("Network Error");
  });
});

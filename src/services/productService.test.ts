import { getProductById, updateProductPrice } from "./productService";
import Product from "../model/Product";
import { fetchProductData } from "../client/redskyClient";

// Mock the DB model and external client — service logic is what we're testing
jest.mock("../model/Product");
jest.mock("../client/redskyClient");

const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedFetchData = fetchProductData as jest.MockedFunction<typeof fetchProductData>;

const redskyResponse = (title: string) => ({
  data: { product: { item: { product_description: { title } } } }
});

describe("productService", () => {

  afterEach(() => jest.clearAllMocks());

  // ─── getProductById ───────────────────────────────────────────────────────

  describe("getProductById", () => {

    it("returns null when the product is not found in MongoDB", async () => {
      mockedProduct.findOne.mockResolvedValue(null);
      mockedFetchData.mockResolvedValue(redskyResponse("Some Title"));

      const result = await getProductById(13860428);

      expect(result).toBeNull();
    });

    it("returns the aggregated product with name and price when found", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchData.mockResolvedValue(redskyResponse("The Big Lebowski (Blu-ray)"));

      const result = await getProductById(13860428);

      expect(result).toEqual({
        id: 13860428,
        name: "The Big Lebowski (Blu-ray)",
        current_price: { value: 13.49, currency_code: "USD" }
      });
    });

    it("falls back to buy_url when title is missing in Redsky response", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchData.mockResolvedValue({
        data: { product: { item: { enrichment: { buy_url: "https://target.com/p/A-13860428" } } } }
      });

      const result = await getProductById(13860428);

      expect(result?.name).toBe("https://target.com/p/A-13860428");
    });

    it("uses placeholder name when Redsky response has no title or buy_url", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchData.mockResolvedValue({ data: { product: { item: {} } } });

      const result = await getProductById(13860428);

      expect(result?.name).toBe("Product Name Not Found");
    });

    it("calls fetchProductData with the product id as a string", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchData.mockResolvedValue(redskyResponse("Some Title"));

      await getProductById(13860428);

      expect(mockedFetchData).toHaveBeenCalledWith("13860428");
    });

    it("propagates error when Redsky API call fails", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchData.mockRejectedValue(new Error("Redsky API down"));

      await expect(getProductById(13860428)).rejects.toThrow("Redsky API down");
    });
  });

  // ─── updateProductPrice ───────────────────────────────────────────────────

  describe("updateProductPrice", () => {

    it("calls findOneAndUpdate with the correct arguments", async () => {
      const updated = { _id: 13860428, value: 15.99, currency_code: "USD" };
      mockedProduct.findOneAndUpdate.mockResolvedValue(updated as any);

      await updateProductPrice(13860428, 15.99, "USD");

      expect(mockedProduct.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 13860428 },
        { value: 15.99, currency_code: "USD" },
        { new: true }
      );
    });

    it("returns the updated document", async () => {
      const updated = { _id: 13860428, value: 15.99, currency_code: "USD" };
      mockedProduct.findOneAndUpdate.mockResolvedValue(updated as any);

      const result = await updateProductPrice(13860428, 15.99, "USD");

      expect(result).toEqual(updated);
    });

    it("returns null when the product id does not exist", async () => {
      mockedProduct.findOneAndUpdate.mockResolvedValue(null);

      const result = await updateProductPrice(99999, 10, "USD");

      expect(result).toBeNull();
    });
  });
});

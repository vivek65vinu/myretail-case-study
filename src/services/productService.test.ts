import { getProductById, updateProductPrice } from "./productService";
import Product from "../model/Product";
import { fetchProductTitle } from "../client/redskyClient";

// Mock the DB model and external client — service logic is what we're testing
jest.mock("../model/Product");
jest.mock("../client/redskyClient");

const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedFetchTitle = fetchProductTitle as jest.MockedFunction<typeof fetchProductTitle>;

describe("productService", () => {

  afterEach(() => jest.clearAllMocks());

  // ─── getProductById ───────────────────────────────────────────────────────

  describe("getProductById", () => {

    it("returns null when the product is not found in MongoDB", async () => {
      mockedProduct.findOne.mockResolvedValue(null);

      const result = await getProductById(13860428);

      expect(result).toBeNull();
      expect(mockedFetchTitle).not.toHaveBeenCalled(); // no Redsky call if DB misses
    });

    it("returns the aggregated product with name and price when found", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428,
        value: 13.49,
        currency_code: "USD"
      } as any);
      mockedFetchTitle.mockResolvedValue("The Big Lebowski (Blu-ray)");

      const result = await getProductById(13860428);

      expect(result).toEqual({
        id: 13860428,
        name: "The Big Lebowski (Blu-ray)",
        current_price: { value: 13.49, currency_code: "USD" }
      });
    });

    it("calls fetchProductTitle with the product id as a string", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchTitle.mockResolvedValue("Some Title");

      await getProductById(13860428);

      expect(mockedFetchTitle).toHaveBeenCalledWith("13860428");
    });

    it("propagates error when Redsky API call fails", async () => {
      mockedProduct.findOne.mockResolvedValue({
        _id: 13860428, value: 13.49, currency_code: "USD"
      } as any);
      mockedFetchTitle.mockRejectedValue(new Error("Redsky API down"));

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

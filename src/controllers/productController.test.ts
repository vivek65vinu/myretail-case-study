import { Request, Response } from "express";
import { getProduct, updateProduct } from "./productController";
import * as productService from "../services/productService";

// Mock the service — controller logic is what we're testing
jest.mock("../services/productService");

const mockedService = productService as jest.Mocked<typeof productService>;

// Helper: build a minimal Express Request mock
function mockReq(params: Record<string, string> = {}, body: object = {}): Partial<Request> {
  return { params, body };
}

// Helper: build a minimal Express Response mock with chainable status/json
function mockRes(): jest.Mocked<Partial<Response>> {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("productController", () => {

  afterEach(() => jest.clearAllMocks());

  // ─── getProduct ───────────────────────────────────────────────────────────

  describe("getProduct", () => {

    it("returns 200 with aggregated product data when found", async () => {
      const product = {
        id: 13860428,
        name: "The Big Lebowski (Blu-ray)",
        current_price: { value: 13.49, currency_code: "USD" }
      };
      mockedService.getProductById.mockResolvedValue(product);

      const req = mockReq({ id: "13860428" });
      const res = mockRes();

      await getProduct(req as Request, res as Response);

      expect(mockedService.getProductById).toHaveBeenCalledWith(13860428);
      expect(res.json).toHaveBeenCalledWith(product);
    });

    it("returns 404 when the product is not found", async () => {
      mockedService.getProductById.mockResolvedValue(null);

      const req = mockReq({ id: "99999" });
      const res = mockRes();

      await getProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("returns 500 when the service throws an unexpected error", async () => {
      mockedService.getProductById.mockRejectedValue(new Error("DB connection lost"));

      const req = mockReq({ id: "13860428" });
      const res = mockRes();

      await getProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB connection lost" });
    });
  });

  // ─── updateProduct ────────────────────────────────────────────────────────

  describe("updateProduct", () => {

    it("returns 200 with the updated product document", async () => {
      const updated = { _id: 13860428, value: 15.99, currency_code: "USD" };
      mockedService.updateProductPrice.mockResolvedValue(updated as any);

      const req = mockReq(
        { id: "13860428" },
        { price: 15.99, currency_code: "USD" }
      );
      const res = mockRes();

      await updateProduct(req as Request, res as Response);

      expect(mockedService.updateProductPrice).toHaveBeenCalledWith(13860428, 15.99, "USD");
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    it("returns 404 when the product does not exist", async () => {
      mockedService.updateProductPrice.mockResolvedValue(null);

      const req = mockReq(
        { id: "99999" },
        { price: 15.99, currency_code: "USD" }
      );
      const res = mockRes();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
    });

    it("returns 500 when the service throws an unexpected error", async () => {
      mockedService.updateProductPrice.mockRejectedValue(new Error("Write failed"));

      const req = mockReq(
        { id: "13860428" },
        { price: 15.99, currency_code: "USD" }
      );
      const res = mockRes();

      await updateProduct(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Write failed" });
    });
  });
});

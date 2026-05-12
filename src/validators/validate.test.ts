import { Request, Response, NextFunction } from "express";
import { validateId, validateUpdateBody } from "./validate";

function mockReq(params: object = {}, body: object = {}): Partial<Request> {
  return { params: params as any, body };
}

function mockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("validateId", () => {

  it("calls next() for a valid positive integer id", () => {
    const next = jest.fn() as NextFunction;
    validateId(mockReq({ id: "13860428" }) as Request, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 400 when id is not a number", () => {
    const res = mockRes();
    validateId(mockReq({ id: "abc" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid id: must be a positive integer" });
  });

  it("returns 400 when id is zero", () => {
    const res = mockRes();
    validateId(mockReq({ id: "0" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when id is negative", () => {
    const res = mockRes();
    validateId(mockReq({ id: "-5" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when id is a decimal", () => {
    const res = mockRes();
    validateId(mockReq({ id: "1.5" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe("validateUpdateBody", () => {

  it("calls next() for a valid price and currency_code", () => {
    const next = jest.fn() as NextFunction;
    validateUpdateBody(mockReq({}, { price: 25.99, currency_code: "USD" }) as Request, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it("returns 400 when price is missing", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { currency_code: "USD" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field: price" });
  });

  it("returns 400 when price is zero", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { price: 0, currency_code: "USD" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Invalid price: must be a positive number" });
  });

  it("returns 400 when price is negative", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { price: -10, currency_code: "USD" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when price is a string", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { price: "25.99", currency_code: "USD" }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when currency_code is missing", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { price: 25.99 }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Missing required field: currency_code" });
  });

  it("returns 400 when currency_code is an empty string", () => {
    const res = mockRes();
    validateUpdateBody(mockReq({}, { price: 25.99, currency_code: "  " }) as Request, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});

# myRetail Products API — Case Study

A RESTful API that aggregates product data from two sources: pricing stored in MongoDB and product names fetched from Target's external Redsky API. Built with Node.js, TypeScript, and Express using a clean layered architecture.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Layered Design](#layered-design)
- [Data Flow](#data-flow)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)

---

## Overview

myRetail is a case study API that solves a common retail pattern: product information lives in different systems. This service stitches them together into a single, clean response.

- **Pricing** is owned internally and stored in MongoDB.
- **Product names/titles** are fetched on demand from Target's Redsky API.
- Clients get both in one call — no need to talk to multiple services.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode, targeting ES2020) |
| Runtime | Node.js |
| Framework | Express.js v5 |
| Database | MongoDB Atlas via Mongoose v9 |
| HTTP Client | Axios |
| Testing | Jest + ts-jest |
| Dev Server | ts-node-dev (hot reload) |

---

## Architecture

<img width="1392" height="858" alt="image" src="https://github.com/user-attachments/assets/f666047c-e307-4881-a2a2-e7f7ed62d1fa" />

```
                        ┌─────────────────┐
                        │     Client      │
                        └────────┬────────┘
                                 │  HTTP Request
                                 ▼
                        ┌─────────────────┐
                        │    app.ts       │  Entry point — wires middleware,
                        │   :8080         │  routes, and DB connection
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  validators/    │  Validates :id and request body
                        │  validate.ts    │  before reaching the controller
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  routes/        │  Maps URLs to controller functions
                        │  index.ts       │
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  controllers/   │  Handles req/res, calls service,
                        │  productCtrl.ts │  returns HTTP response
                        └────────┬────────┘
                                 │
                        ┌────────▼────────┐
                        │  services/      │  Business logic — fires MongoDB +
                        │  productSvc.ts  │  Redsky calls in parallel, merges result
                        └────┬───────┬────┘
                             │       │
               ┌─────────────▼─┐ ┌───▼──────────────┐
               │  model/       │ │  client/          │
               │  Product.ts   │ │  db.ts            │
               │               │ │  redskyClient.ts  │
               │  MongoDB      │ │                   │
               │  product_     │ │  MongoDB + Redsky │
               │  prices coll. │ │  as clients       │
               └───────────────┘ └───────────────────┘
```

---

## Layered Design

Each layer has a single responsibility. No layer skips another — requests always flow top-down.

| Layer | File | Responsibility | Knows About |
|---|---|---|---|
| **Validators** | `validators/validate.ts` | Reject invalid input before it hits business logic | Express req/res |
| **Routes** | `routes/index.ts` | Register all routers in one place | Express Router |
| **Routes** | `routes/productRoutes.ts` | Map HTTP verb + URL → validator → controller | Controller, Validators |
| **Controller** | `controllers/productController.ts` | Parse req, call service, send res | HTTP (req/res) |
| **Service** | `services/productService.ts` | Business logic — parallel data fetch + mapping | Model + Client |
| **Client** | `client/redskyClient.ts` | Pure HTTP call to Redsky, returns raw data | Axios, env vars |
| **Client** | `client/db.ts` | MongoDB connection (treated as a client) | Mongoose, env vars |
| **Model** | `model/Product.ts` | MongoDB schema definition | Mongoose |

### Key Design Decisions

- **Validators as a dedicated layer** — input is rejected with a `400` before it ever reaches the controller or service, keeping business logic clean.
- **MongoDB treated as a client** — `db.ts` lives in `client/` alongside `redskyClient.ts` because both are external systems the app connects to.
- **Parallel data fetching** — MongoDB and Redsky API calls fire simultaneously via `Promise.all`, cutting GET response time roughly in half.
- **Pure HTTP client** — `redskyClient.ts` only transports data. All response mapping lives in the service layer where it can be tested independently.
- **Custom `_id`** — MongoDB documents use the product's numeric ID as `_id`, so lookups are direct key fetches with no extra index.

---

## Data Flow

### GET /products/:id

```
Request
  │
  ▼
validateId        ← 400 if id is not a positive integer
  │
  ▼
productController.getProduct()
  │
  ▼
productService.getProductById(id)
  │
  ├── Promise.all ──────────────────────────────┐
  │         │                                   │
  ▼         ▼                                   ▼
MongoDB lookup                         Redsky API call
product_prices                         fetchProductData(id)
  │                                             │
  └──────────────── merge ──────────────────────┘
                      │
                      ▼
        { id, name, current_price }
                      │
                      ▼
               200 JSON Response
```

### PUT /products/:id

```
Request
  │
  ▼
validateId          ← 400 if id is not a positive integer
  │
  ▼
validateUpdateBody  ← 400 if price or currency_code is missing/invalid
  │
  ▼
productController.updateProduct()
  │
  ▼
productService.updateProductPrice(id, price, currency_code)
  │
  ▼
MongoDB findOneAndUpdate()
  │
  ▼
200 Updated Document
```

---

## API Reference

### GET `/products/:id`

Fetches aggregated product data — name from Redsky, price from MongoDB.

**Example request:**
```
GET /products/13860428
```

**Example response (200):**
```json
{
  "id": 13860428,
  "name": "The Big Lebowski (Blu-ray)",
  "current_price": {
    "value": 13.49,
    "currency_code": "USD"
  }
}
```

**Error responses:**

| Status | Condition |
|---|---|
| `400` | `id` is not a positive integer |
| `404` | Product not found in MongoDB |
| `500` | Unexpected server error |

---

### PUT `/products/:id`

Updates the price for a product stored in MongoDB.

**Example request:**
```
PUT /products/13860428
Content-Type: application/json

{
  "price": 15.99,
  "currency_code": "USD"
}
```

**Example response (200):**
```json
{
  "_id": 13860428,
  "value": 15.99,
  "currency_code": "USD"
}
```

**Error responses:**

| Status | Condition |
|---|---|
| `400` | `id` is not a positive integer |
| `400` | `price` is missing, not a number, or not positive |
| `400` | `currency_code` is missing or empty |
| `500` | Unexpected server error |

---

## Project Structure

```
Case_Study_MyRetail/
├── src/
│   ├── app.ts                          # Entry point — loads env, connects DB, starts server
│   ├── client/
│   │   ├── db.ts                       # MongoDB connection (treated as a client)
│   │   └── redskyClient.ts             # Pure HTTP client for Target's Redsky API
│   ├── controllers/
│   │   └── productController.ts        # Handles HTTP req/res, delegates to service
│   ├── model/
│   │   └── Product.ts                  # Mongoose schema for product_prices collection
│   ├── routes/
│   │   ├── index.ts                    # Registers all route modules
│   │   └── productRoutes.ts            # Wires validators + controller to routes
│   ├── services/
│   │   └── productService.ts           # Business logic — parallel fetch + data mapping
│   └── validators/
│       └── validate.ts                 # Input validation for :id and request body
├── .env.example                        # Template for required environment variables
├── tsconfig.json                       # TypeScript config (strict, ES2020, commonjs)
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB Atlas cluster (or local MongoDB instance)

### Install dependencies

```bash
npm install
```

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### Seed the database

Insert at least one document into the `product_prices` collection before making GET requests:

```js
// MongoDB shell or Compass
db.product_prices.insertOne({
  _id: 13860428,
  value: 13.49,
  currency_code: "USD"
})
```

### Start the development server

```bash
npm run dev
```

Server starts on `http://localhost:8080` with hot reload via `ts-node-dev`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `8080` |
| `MONGO_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/myretail` |
| `REDSKY_TARGET_URL` | Base URL for Target's Redsky API | `https://redsky.target.com/redsky_aggregations/v1/redsky/case_study_v1` |
| `KEY` | Redsky API key | `9f36aeafbe607...` |

---

## Running Tests

```bash
npm test
```

29 tests across 4 suites — every layer tested in isolation with mocks.

| Suite | What it tests |
|---|---|
| `validators/validate.test.ts` | Invalid id, missing/bad price, missing currency_code |
| `client/redskyClient.test.ts` | Raw HTTP call, URL construction, axios error propagation |
| `services/productService.test.ts` | Parallel fetch, data mapping, null product, error propagation |
| `controllers/productController.test.ts` | 200/404/500 responses, correct service delegation |

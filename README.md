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
| Testing | Jest + Supertest + ts-jest |
| Dev Server | ts-node-dev (hot reload) |

---

## Architecture

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
                        │  services/      │  Business logic — aggregates data
                        │  productSvc.ts  │  from MongoDB and Redsky API
                        └────┬───────┬────┘
                             │       │
               ┌─────────────▼─┐ ┌───▼──────────────┐
               │  model/       │ │  client/          │
               │  Product.ts   │ │  redskyClient.ts  │
               │               │ │                   │
               │  MongoDB      │ │  Target Redsky    │
               │  product_     │ │  External API     │
               │  prices coll. │ └───────────────────┘
               └───────────────┘
```

---

## Layered Design

Each layer has a single responsibility. No layer skips another — requests always flow top-down.

| Layer | File | Responsibility | Knows About |
|---|---|---|---|
| **Routes** | `routes/index.ts` | Register all routers in one place | Express Router |
| **Routes** | `routes/productRoutes.ts` | Map HTTP verb + URL to controller | Controller |
| **Controller** | `controllers/productController.ts` | Parse req, call service, send res | HTTP (req/res) |
| **Service** | `services/productService.ts` | Business logic, data aggregation | Model + Client |
| **Client** | `client/redskyClient.ts` | Pure HTTP call to Redsky API | Axios, env vars |
| **Model** | `model/Product.ts` | MongoDB schema definition | Mongoose |
| **Config** | `config/db.ts` | MongoDB connection | Mongoose, env vars |

### Key Design Decisions

- **Layered architecture** — each layer only talks to the one directly below it, making individual layers easy to test, swap, or scale independently.
- **Custom `_id`** — MongoDB documents use the product's numeric ID as `_id` (instead of ObjectId), so lookups are direct key fetches with no extra index.
- **Aggregation in the service layer** — merging price (MongoDB) and name (Redsky) happens in `productService`, keeping the controller thin and the business logic in one testable place.
- **Pure HTTP client** — `redskyClient.ts` only makes the API call and returns data. No business logic, no DB calls — easy to mock in tests.

---

## Data Flow

### GET /products/:id — Fetch product with price

```
Request  →  Router  →  productController.getProduct()
                              │
                              ▼
                       productService.getProductById(id)
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             MongoDB lookup        Redsky API call
             product_prices        fetchProductTitle(id)
                    │                    │
                    └─────────┬──────────┘
                              ▼
                    Merge → { id, name, current_price }
                              │
                              ▼
                         200 JSON Response
```

### PUT /products/:id — Update product price

```
Request  →  Router  →  productController.updateProduct()
                              │
                              ▼
                       productService.updateProductPrice(id, value, currency_code)
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
| `404` | Product ID not found in MongoDB |
| `500` | Unexpected server error (e.g. Redsky API failure) |

---

### PUT `/products/:id`

Updates the price for a product stored in MongoDB.

**Example request:**
```
PUT /products/13860428
Content-Type: application/json

{
  "current_price": {
    "value": 15.99,
    "currency_code": "USD"
  }
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

---

## Project Structure

```
Case_Study_MyRetail/
├── src/
│   ├── app.ts                          # Entry point — env, middleware, routes, server
│   ├── config/
│   │   └── db.ts                       # MongoDB Atlas connection
│   ├── routes/
│   │   ├── index.ts                    # Registers all route modules
│   │   └── productRoutes.ts            # Maps /products/:id to controller functions
│   ├── controllers/
│   │   └── productController.ts        # Handles HTTP req/res, delegates to service
│   ├── services/
│   │   └── productService.ts           # Business logic — aggregates price + name
│   ├── client/
│   │   └── redskyClient.ts             # Pure HTTP client for Target's Redsky API
│   └── model/
│       └── Product.ts                  # Mongoose schema for product_prices collection
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

Tests use **Jest** with **Supertest** for HTTP-level integration tests and **ts-jest** to run TypeScript directly without a separate compile step.

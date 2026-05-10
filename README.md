# myRetail Products API — Case Study

A RESTful API that aggregates product data from two sources: pricing stored in MongoDB and product names fetched from Target's external Redsky API. Built with Node.js, TypeScript, and Express.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
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
┌────────────────────────────────────────────┐
│                  Client                    │
└────────────────────┬───────────────────────┘
                     │  HTTP Request
                     ▼
┌────────────────────────────────────────────┐
│           Express.js API Server            │
│            (src/app.ts :8080)              │
│                                            │
│  ┌─────────────────────────────────────┐   │
│  │       Product Routes                │   │
│  │   (src/routes/productRoutes.ts)     │   │
│  │                                     │   │
│  │   GET /products/:id                 │   │
│  │   PUT /products/:id                 │   │
│  └──────────┬──────────────┬───────────┘   │
│             │              │               │
│             ▼              ▼               │
│  ┌──────────────┐  ┌───────────────────┐   │
│  │   MongoDB    │  │   Redsky Client   │   │
│  │  (Mongoose)  │  │ (src/client/      │   │
│  │              │  │  redskyClient.ts) │   │
│  │ product_     │  │                   │   │
│  │ prices coll. │  │ Target Redsky API │   │
│  └──────────────┘  └───────────────────┘   │
└────────────────────────────────────────────┘
```

### Key Design Decisions

- **Separation of concerns** — the Redsky HTTP client lives in its own module (`src/client/`) so it can be swapped or mocked independently.
- **Custom `_id`** — MongoDB documents use the product's numeric ID as `_id` (instead of ObjectId), making lookups direct key fetches with no extra index.
- **Data aggregation at the route layer** — the router calls both data sources in sequence and merges the result before responding, keeping the logic easy to follow and test.

---

## Data Flow

### GET /products/:id — Fetch product with price

```
1. Extract numeric product ID from URL param
2. Query MongoDB `product_prices` collection by _id
   └─ 404 if not found
3. Call Target Redsky API with the same ID to fetch product title
4. Merge: { id, name, current_price: { value, currency_code } }
5. Return 200 JSON response
```

### PUT /products/:id — Update product price

```
1. Extract numeric product ID from URL param
2. Read { current_price: { value, currency_code } } from request body
3. findOneAndUpdate in MongoDB `product_prices` collection
4. Return updated document
```

---

## API Reference

### GET `/products/:id`

Fetches aggregated product data (name from Redsky + price from MongoDB).

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

Updates the price for a product in MongoDB.

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
│   ├── app.ts                    # Express app setup, MongoDB connection, server entry point
│   ├── routes/
│   │   └── productRoutes.ts      # GET and PUT /products/:id handlers
│   ├── client/
│   │   └── redskyClient.ts       # Axios call to Target's Redsky API
│   └── model/
│       └── Product.ts            # Mongoose schema for product_prices collection
├── .env.example                  # Template for required environment variables
├── tsconfig.json                 # TypeScript config (strict, ESM interop, ES2020 target)
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

Edit `.env` with your MongoDB connection string (see [Environment Variables](#environment-variables)).

### Seed the database

Insert at least one document into the `product_prices` collection before making GET requests:

```js
// In MongoDB shell or Compass
db.product_prices.insertOne({
  _id: 13860428,
  value: 13.49,
  currency_code: "USD"
})
```

### Start the development server

```bash
npm run start
```

Server starts on `http://localhost:8080` with hot reload via `ts-node-dev`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port the Express server listens on | `8080` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/myretail` |

---

## Running Tests

```bash
npm test
```

Tests use **Jest** with **Supertest** for HTTP-level integration tests and **ts-jest** to run TypeScript directly without a separate compile step.

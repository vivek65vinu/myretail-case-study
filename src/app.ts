import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import routes from "./routes";

dotenv.config();

const app = express();

function registerMiddleware() {
  app.use(express.json());
}

function registerRoutes() {
  app.use(routes);
}

async function init() {
  await connectDB();
  registerMiddleware();
  registerRoutes();

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

init().catch(console.error);

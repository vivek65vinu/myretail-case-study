import express from "express";
import { env } from "./config/env";
import { connectDB } from "./config/db";
import routes from "./routes";

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

  app.listen(env.PORT, () => console.log(`Server running on port ${env.PORT}`));
}

init().catch(console.error);

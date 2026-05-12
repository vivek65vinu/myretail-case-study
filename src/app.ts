import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./client/db";
import routes from "./routes";

dotenv.config();

const app = express();

const init = async () => {
  await connectDB();
  app.use(express.json());
  app.use(routes);

  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

init().catch(console.error);

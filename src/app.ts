import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import productRoutes from "./routes/productRoutes";

dotenv.config();

const app = express();
app.use(express.json());

connectDB().catch(console.error);

app.use("/products", productRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

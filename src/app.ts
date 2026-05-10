import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import productRoutes from "./routes/productRoutes";

// Load environment variables from .env before anything else reads process.env
dotenv.config();

const app = express();

// Parse incoming JSON request bodies (required for PUT /products/:id)
app.use(express.json());

// Connect to MongoDB Atlas; MONGO_URI is set in .env
mongoose.connect(process.env.MONGO_URI!)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
  });

// Mount all product-related routes under /products
app.use("/products", productRoutes);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

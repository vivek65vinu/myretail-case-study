import mongoose from "mongoose";

// Connects to MongoDB Atlas using MONGO_URI from .env
export async function connectDB() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log("MongoDB Connected");
}

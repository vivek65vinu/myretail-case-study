import { Router } from "express";
import productRoutes from "./productRoutes";

const router = Router();

// Register all route modules here — add new ones as the API grows
router.use("/products", productRoutes);

export default router;

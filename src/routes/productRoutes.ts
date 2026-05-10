import { Router } from "express";
import { getProduct, updateProduct } from "../controllers/productController";

const router = Router();

// Routes are thin — they only map HTTP verbs/paths to controller functions
router.get("/:id", getProduct);
router.put("/:id", updateProduct);

export default router;

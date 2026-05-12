import { Router } from "express";
import { getProduct, updateProduct } from "../controllers/productController";
import { validateId, validateUpdateBody } from "../validators/validate";

const router = Router();

router.get("/:id", validateId, getProduct);
router.put("/:id", validateId, validateUpdateBody, updateProduct);

export default router;

import { Router } from "express";
import { listProducts, createProduct, updateProduct } from "../controllers/products.controller.js";
const r = Router();

r.get("/", listProducts);
r.post("/", createProduct);
r.patch("/:id", updateProduct);

export default r;
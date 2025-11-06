import { Router } from "express";
import { createSale, getSale, updateSaleStatus } from "../controllers/sales.controller.js";
const r = Router();

r.post("/", createSale);
r.get("/", getSale);   
r.get("/:id", getSale);
r.put("/:id/estado", updateSaleStatus);

export default r;
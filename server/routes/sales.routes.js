import { Router } from "express";
import { createSale, getSale } from "../controllers/sales.controller.js";
const r = Router();

r.post("/", createSale);
r.get("/", getSale);   
r.get("/:id", getSale);

export default r;


import { Router } from "express";
import { listExpenses, createExpense } from "../controllers/expenses.controller.js";
const r = Router();

r.get("/", listExpenses);
r.post("/", createExpense);

export default r;
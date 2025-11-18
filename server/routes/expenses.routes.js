import { Router } from "express";
import {
  listExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from "../controllers/expenses.controller.js";

const r = Router();

r.get("/", listExpenses);
r.post("/", createExpense);
r.put("/:id", updateExpense);
r.delete("/:id", deleteExpense);

export default r;

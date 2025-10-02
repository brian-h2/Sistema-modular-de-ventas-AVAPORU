import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "./db.js";

import productsRouter from "./routes/products.routes.js";
import salesRouter from "./routes/sales.routes.js";
import expensesRouter from "./routes/expenses.routes.js";
import authRouter from "./routes/auth.routes.js";
import { authRequired, requireRole } from "./middlewares/auth.middleware.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas ejemplo
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  await connectDB(process.env.MONGODB_URI);
  console.log(`🚀 API en http://localhost:${PORT}`);
});

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "*",
  credentials: true
}));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);

app.use("/products", authRequired, productsRouter);
app.use("/sales",    authRequired, salesRouter);
app.use("/expenses", authRequired, expensesRouter);

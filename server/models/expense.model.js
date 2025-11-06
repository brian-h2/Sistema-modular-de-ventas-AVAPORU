import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  categoria: { type: String, required: true, trim: true },
  descripcion: { type: String, trim: true },
  monto: { type: Number, required: true, min: 0 },
}, { timestamps: true });

export default mongoose.model("Expense", expenseSchema);

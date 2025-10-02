import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  precio: { type: Number, required: true, min: 0 },
  stockDisponible: { type: Number, required: true, min: 0, default: 0 },
  stockMinimo: { type: Number, min: 0, default: 0 },
  categoria: { type: String, default: "General" },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
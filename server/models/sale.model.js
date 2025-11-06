import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  sku: { type: String, required: true },
  nombre: { type: String, required: true },
  cantidad: { type: Number, required: true, min: 1 },
  precioUnitario: { type: Number, required: true, min: 0 },
  subtotal: { type: Number, required: true, min: 0 },
}, { _id: false });

const saleSchema = new mongoose.Schema({
  fecha: { type: Date, default: Date.now },
  cliente: { type: String }, // si más adelante querés relación, se cambia
  items: { type: [saleItemSchema], required: true },
  total: { type: Number, required: true, min: 0 },
  estado: { type: String, enum: ["CREADA","PAGADA","FACTURADA","CANCELADA"], default: "CREADA" },
}, { timestamps: true });

export default mongoose.model("Sale", saleSchema);
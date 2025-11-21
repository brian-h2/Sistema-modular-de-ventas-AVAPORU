import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  descripcion: { type: String, required: true, trim: true },
  fecha: { type: Date, required: true },
  categoria: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model("Reporte", reportSchema);

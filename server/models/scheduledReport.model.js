import mongoose from "mongoose";

const scheduledReportSchema = new mongoose.Schema({
  tipo: { type: String, enum: ["Ventas", "Gastos", "Inventario"], required: true },
  frecuencia: { type: String, enum: ["Diario", "Semanal", "Mensual"], required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  activo: { type: Boolean, default: true },
  ultimoEnvio: { type: Date },
  creadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

export default mongoose.model("ScheduledReport", scheduledReportSchema);

import Reporte from "../models/report.model.js";

export async function listarReportes(req, res) {
  const items = await Reporte.find().sort({ fecha: -1 });
  res.json(items);
}

export async function crearReporte(req, res) {
  try {
    const rep = await Reporte.create(req.body);
    res.status(201).json(rep);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function borrarReporte(req, res) {
  await Reporte.findByIdAndDelete(req.params.id);
  res.json({ message: "Reporte eliminado" });
}

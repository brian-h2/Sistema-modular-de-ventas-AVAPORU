import Reporte from "../models/report.model.js";
import Venta from "../models/sale.model.js";


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


export async function reporteVentas(req, res) {
  try {
    const { start, end } = req.query;

    const filtro = {};
    if (start && end) {
      filtro.fecha = { $gte: new Date(start), $lte: new Date(end) };
    }

    const ventas = await Venta.find(filtro).sort({ fecha: 1 });

    const totalVentas = ventas.reduce((a, v) => a + v.total, 0);

    const grafico = ventas.map(v => ({
      fecha: v.fecha,
      total: v.total
    }));

    res.json({
      totalVentas,
      cantidadVentas: ventas.length,
      grafico,
      ventas
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


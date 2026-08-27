import Reporte from "../models/report.model.js";
import Venta from "../models/sale.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";


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
    if (start || end) {
      filtro.fecha = {};
      if (start) {
        let sDate;
        if (start.includes("-")) {
          const [y, m, d] = start.split("-").map(Number);
          sDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
        } else if (start.includes("/")) {
          const [d, m, y] = start.split("/").map(Number);
          sDate = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
        } else {
          sDate = new Date(start);
        }
        filtro.fecha.$gte = sDate;
      }
      if (end) {
        let eDate;
        if (end.includes("-")) {
          const [y, m, d] = end.split("-").map(Number);
          eDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
        } else if (end.includes("/")) {
          const [d, m, y] = end.split("/").map(Number);
          eDate = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
        } else {
          eDate = new Date(end);
        }
        filtro.fecha.$lte = eDate;
      }
    }

    const ventas = await Venta.find(filtro)
      .populate("items.product", "categoria nombre marca precio")
      .populate("vendedor", "nombre username")
      .sort({ fecha: 1 })
      .lean();

    const totalVentas = ventas.reduce((a, v) => a + Number(v.total || 0), 0);

    // 1. Agrupación diaria para el gráfico de barras
    const dailyMap = new Map();
    ventas.forEach((v) => {
      if (!v.fecha) return;
      const d = new Date(v.fecha);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      
      const current = dailyMap.get(key) || { key, fecha: d.toISOString(), label, dia: label, total: 0, cantidad: 0 };
      current.total += Number(v.total || 0);
      current.cantidad += 1;
      dailyMap.set(key, current);
    });

    const sortedDaily = Array.from(dailyMap.values()).sort((a, b) => a.key.localeCompare(b.key));

    // 2. Agrupación por Categoría de Producto
    const catMap = new Map();
    ventas.forEach((v) => {
      if (Array.isArray(v.items) && v.items.length > 0) {
        v.items.forEach((item) => {
          const cat = item.product?.categoria || item.categoria || "Calzado";
          const sub = Number(item.subtotal || (Number(item.precioUnitario || 0) * Number(item.cantidad || 1)) || 0);
          catMap.set(cat, (catMap.get(cat) || 0) + sub);
        });
      } else {
        catMap.set("Calzado", (catMap.get("Calzado") || 0) + Number(v.total || 0));
      }
    });

    const categorias = Array.from(catMap.entries()).map(([categoria, total]) => ({
      categoria,
      total: Math.round(total),
    }));

    // 3. Listado de detalles formateados
    const detalles = ventas.map((v) => ({
      _id: v._id,
      cliente: v.cliente || "Consumidor Final",
      descripcion: `Venta #${String(v._id).slice(-6).toUpperCase()} - ${v.cliente || "Consumidor Final"}`,
      itemsCount: v.items?.length || 1,
      estado: v.estado || "CREADA",
      fecha: v.fecha,
      total: Number(v.total || 0),
    })).reverse();

    res.json({
      totalVentas,
      cantidadVentas: ventas.length,
      grafico: sortedDaily,
      categorias,
      detalles,
      ventas,
    });
  } catch (err) {
    console.error("Error en reporteVentas:", err);
    res.status(500).json({ error: err.message });
  }
}


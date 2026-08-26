import Sale from "../models/sale.model.js";
import Expense from "../models/expense.model.js";
import Product from "../models/product.model.js";

const money = (n) => "$" + Number(n || 0).toLocaleString("es-AR");

/**
 * Devuelve el rango de fechas [desde, hasta] correspondiente a la frecuencia
 * del reporte programado, terminando en "ahora".
 */
export function rangoPorFrecuencia(frecuencia) {
  const hasta = new Date();
  const desde = new Date(hasta);

  if (frecuencia === "Diario") desde.setDate(desde.getDate() - 1);
  else if (frecuencia === "Semanal") desde.setDate(desde.getDate() - 7);
  else if (frecuencia === "Mensual") desde.setMonth(desde.getMonth() - 1);
  else desde.setDate(desde.getDate() - 1);

  return { desde, hasta };
}

async function buildVentasReport(desde, hasta) {
  const ventas = await Sale.find({ fecha: { $gte: desde, $lte: hasta } }).sort({ fecha: 1 });
  const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);

  const filas = ventas
    .map(
      (v) =>
        `<tr><td>${new Date(v.fecha).toLocaleDateString("es-AR")}</td><td>${v.cliente || "Consumidor Final"}</td><td>${v.estado}</td><td style="text-align:right">${money(v.total)}</td></tr>`
    )
    .join("");

  return {
    titulo: "Reporte de Ventas",
    resumen: [
      { label: "Total vendido", value: money(totalVentas) },
      { label: "Cantidad de ventas", value: ventas.length },
      { label: "Ticket promedio", value: money(ventas.length ? totalVentas / ventas.length : 0) },
    ],
    tabla: {
      encabezados: ["Fecha", "Cliente", "Estado", "Total"],
      filasHtml: filas || `<tr><td colspan="4">Sin ventas registradas en el período</td></tr>`,
    },
  };
}

async function buildGastosReport(desde, hasta) {
  const gastos = await Expense.find({ fecha: { $gte: desde, $lte: hasta } }).sort({ fecha: 1 });
  const totalGastado = gastos.reduce((acc, g) => acc + g.monto, 0);
  const totalPresupuesto = gastos.reduce((acc, g) => acc + (g.presupuestoDisponible || 0), 0);

  const filas = gastos
    .map(
      (g) =>
        `<tr><td>${new Date(g.fecha).toLocaleDateString("es-AR")}</td><td>${g.categoria}</td><td>${g.descripcion || "-"}</td><td style="text-align:right">${money(g.monto)}</td></tr>`
    )
    .join("");

  return {
    titulo: "Reporte de Gastos",
    resumen: [
      { label: "Total gastado", value: money(totalGastado) },
      { label: "Presupuesto declarado", value: money(totalPresupuesto) },
      { label: "Cantidad de gastos", value: gastos.length },
    ],
    tabla: {
      encabezados: ["Fecha", "Categoría", "Descripción", "Monto"],
      filasHtml: filas || `<tr><td colspan="4">Sin gastos registrados en el período</td></tr>`,
    },
  };
}

async function buildInventarioReport() {
  const productos = await Product.find({}).sort({ stockDisponible: 1 });
  const sinStock = productos.filter((p) => p.stockDisponible === 0);
  const critico = productos.filter((p) => p.stockDisponible > 0 && p.stockDisponible <= p.stockMinimo);
  const alertas = [...sinStock, ...critico];

  const filas = alertas
    .map(
      (p) =>
        `<tr><td>${p.sku}</td><td>${p.nombre}</td><td>${p.categoria || "-"}</td><td style="text-align:right">${p.stockDisponible}</td><td style="text-align:right">${p.stockMinimo}</td></tr>`
    )
    .join("");

  return {
    titulo: "Reporte de Inventario",
    resumen: [
      { label: "Total de productos", value: productos.length },
      { label: "Sin stock", value: sinStock.length },
      { label: "Stock crítico", value: critico.length },
    ],
    tabla: {
      encabezados: ["SKU", "Producto", "Categoría", "Stock", "Mínimo"],
      filasHtml: filas || `<tr><td colspan="5">No hay productos con stock bajo o crítico 👌</td></tr>`,
    },
  };
}

/**
 * Arma los datos del reporte según el tipo. "Inventario" es una foto del
 * momento (no depende de rango de fechas); Ventas y Gastos sí.
 */
export async function buildReportData(tipo, desde, hasta) {
  if (tipo === "Ventas") return buildVentasReport(desde, hasta);
  if (tipo === "Gastos") return buildGastosReport(desde, hasta);
  if (tipo === "Inventario") return buildInventarioReport();
  throw new Error(`Tipo de reporte desconocido: ${tipo}`);
}

export function renderReportHtml({ titulo, resumen, tabla }, { frecuencia, desde, hasta }) {
  const periodo =
    desde && hasta
      ? `${new Date(desde).toLocaleDateString("es-AR")} — ${new Date(hasta).toLocaleDateString("es-AR")}`
      : "Estado actual";

  const resumenHtml = resumen
    .map(
      (r) =>
        `<td style="padding:12px 16px;background:#f8fafc;border-radius:8px;text-align:center">
           <div style="font-size:12px;color:#64748b;margin-bottom:4px">${r.label}</div>
           <div style="font-size:18px;font-weight:700;color:#0f172a">${r.value}</div>
         </td>`
    )
    .join(`<td style="width:12px"></td>`);

  const headersHtml = tabla.encabezados
    .map((h) => `<th style="text-align:left;padding:8px;border-bottom:2px solid #e2e8f0;color:#475569;font-size:12px;text-transform:uppercase">${h}</th>`)
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#1e293b">
    <div style="background:#10b981;padding:20px 24px;border-radius:12px 12px 0 0">
      <h1 style="color:#fff;margin:0;font-size:20px">${titulo}</h1>
      <p style="color:#d1fae5;margin:4px 0 0;font-size:13px">Frecuencia: ${frecuencia} · Período: ${periodo}</p>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;padding:24px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px"><tr>${resumenHtml}</tr></table>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead><tr>${headersHtml}</tr></thead>
        <tbody>${tabla.filasHtml}</tbody>
      </table>
      <p style="color:#94a3b8;font-size:11px;margin-top:24px">Reporte automático generado por AVAPORU.</p>
    </div>
  </div>`;
}

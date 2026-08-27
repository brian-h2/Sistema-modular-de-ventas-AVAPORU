import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  Download,
  BarChart2,
  FileText,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Filter,
  PlusCircle,
  Trash2,
  Mail,
  Send,
  Power
} from "lucide-react";
import { createReport, deleteReport, getSalesReport, listReports } from "../services/reportService";
import { listSales } from "../services/salesServices";
import { listProducts } from "../services/productsService";
import { listExpenses } from "../services/expenseService";
import { calculateSalesPredictions } from "../utils/salesPredictionEngine";
import {
  listScheduledReports,
  createScheduledReport,
  toggleScheduledReport,
  sendScheduledReportNow,
  deleteScheduledReport,
  type ScheduledReport,
} from "../services/scheduledReportsService";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { DateInputDDMMYYYY } from "../components/ui/DateInputDDMMYYYY";

const exportarPDF = (salesReport: any, filterDesde: string, filterHasta: string) => {
  const ventasList = salesReport?.detalles && salesReport.detalles.length > 0
    ? salesReport.detalles
    : (salesReport?.ventas ?? []);

  if (!ventasList || ventasList.length === 0) {
    Swal.fire("Sin datos", "No hay ventas en este período para exportar a PDF", "info");
    return;
  }

  Swal.fire({
    title: 'Generando PDF de Ventas...',
    text: 'Compilando listado completo de transacciones...',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const doc = new jsPDF("portrait", "mm", "a4");

    // Cabecera institucional
    doc.setFillColor(16, 185, 129); // Emerald principal
    doc.rect(0, 0, 210, 24, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.text("SISTEMA MODULAR AVAPORU - LISTADO DE VENTAS", 14, 15);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(13);
    const formatoFecha = (f: string) => {
      if (!f) return "";
      const parts = f.split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : f;
    };
    const rangoStr = filterDesde || filterHasta
      ? `Período: ${filterDesde ? formatoFecha(filterDesde) : 'Inicio'} al ${filterHasta ? formatoFecha(filterHasta) : 'Actualidad'}`
      : "Período: Historial Completo de Ventas";

    doc.text(rangoStr, 14, 34);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`, 14, 41);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 46, 196, 46);

    // Resumen Estadístico
    const totalVendido = salesReport?.totalVentas ?? ventasList.reduce((acc: number, v: any) => acc + Number(v.total || 0), 0);
    const totalOrdenes = salesReport?.cantidadVentas ?? ventasList.length;
    const ticketPromedio = totalOrdenes > 0 ? totalVendido / totalOrdenes : 0;

    let y = 52;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, 182, 22, 2, 2, "F");
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, 182, 22, 2, 2, "D");

    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("Total Facturado", 20, y + 7);
    doc.text("Órdenes / Ventas", 85, y + 7);
    doc.text("Ticket Promedio", 145, y + 7);

    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(`$${totalVendido.toLocaleString("es-AR")}`, 20, y + 16);
    doc.setTextColor(30, 41, 59);
    doc.text(`${totalOrdenes}`, 85, y + 16);
    doc.text(`$${ticketPromedio.toLocaleString("es-AR", { maximumFractionDigits: 0 })}`, 145, y + 16);

    y += 30;

    // Función para imprimir cabecera de tabla
    const printTableHeader = (currentY: number) => {
      doc.setFillColor(241, 245, 249);
      doc.rect(14, currentY - 4, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("#", 16, currentY);
      doc.text("FECHA", 26, currentY);
      doc.text("CLIENTE / DETALLE", 52, currentY);
      doc.text("ARTÍCULOS", 125, currentY);
      doc.text("ESTADO", 152, currentY);
      doc.text("TOTAL", 176, currentY);
      doc.line(14, currentY + 3, 196, currentY + 3);
    };

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Detalle de Transacciones (${ventasList.length} registros)`, 14, y - 6);

    printTableHeader(y);
    y += 8;

    ventasList.forEach((v: any, index: number) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        printTableHeader(y);
        y += 8;
      }

      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(String(index + 1), 16, y);

      const fechaStr = v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR") : "-";
      doc.text(fechaStr, 26, y);

      doc.setTextColor(30, 41, 59);
      const clienteStr = doc.splitTextToSize(v.cliente || "Consumidor Final", 68);
      doc.text(clienteStr, 52, y);

      doc.setTextColor(100, 116, 139);
      doc.text(`${v.itemsCount || v.items?.length || 1} unid.`, 125, y);

      doc.text(v.estado || "CREADA", 152, y);

      doc.setTextColor(16, 185, 129);
      doc.text(`$${Number(v.total || 0).toLocaleString("es-AR")}`, 176, y);

      y += 6.5;
    });

    const filename = `listado_ventas_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo generar el PDF del listado de ventas", "error");
  }
};

const exportarExcel = (salesReport: any) => {
  const ventasList = salesReport?.detalles && salesReport.detalles.length > 0
    ? salesReport.detalles
    : (salesReport?.ventas ?? []);

  if (!ventasList || ventasList.length === 0) {
    Swal.fire("Info", "No hay datos para exportar", "info");
    return;
  }
  
  const headers = ["#", "Fecha", "Cliente", "Artículos", "Estado", "Total ($)"];
  const rows = ventasList.map((v: any, i: number) => [
    i + 1,
    v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR") : "-",
    `"${(v.cliente || "Consumidor Final").replace(/"/g, '""')}"`,
    v.itemsCount || v.items?.length || 1,
    v.estado || "CREADA",
    v.total || 0
  ]);
  
  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `listado_ventas_${new Date().toLocaleDateString("es-AR").replace(/\//g, "-")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export function ReportsModule() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const chartColors = {
    grid: isDark ? "#334155" : "#f3f4f6",
    axisText: isDark ? "#94a3b8" : "#4b5563",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipBorder: isDark ? "#334155" : "#e5e7eb",
    tooltipText: isDark ? "#e2e8f0" : "#1e293b",
  };
  const [reportes, setReportes] = useState<any[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    tipo: "Ventas",
    frecuencia: "Diario",
    email: ""
  });
  const [filterDesde, setFilterDesde] = useState("");
  const [filterHasta, setFilterHasta] = useState("");
  const [salesReport, setSalesReport] = useState<any>(null);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  const fetchSales = async () => {
    const data = await getSalesReport(filterDesde, filterHasta);
    setSalesReport(data);
  };

  const fetchScheduledReports = async () => {
    try {
      const data = await listScheduledReports();
      setScheduledReports(data);
    } catch (e) {
      console.error("Error al cargar reportes programados:", e);
    }
  };

  useEffect(() => {
    fetchSales();
    listReports().then(setReportes);
    fetchScheduledReports();
  }, []);

  const totalVentas = salesReport?.totalVentas ?? 0;
  const cantidadVentas = salesReport?.cantidadVentas ?? 0;

  // Listas y agregaciones seguras para gráficos y listado
  const dailyChartData = (salesReport?.grafico ?? []).map((g: any) => {
    let label = g.label || g.dia;
    if (!label && g.fecha) {
      const d = new Date(g.fecha);
      label = `${String(d.getUTCDate()).padStart(2, "0")}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    }
    return {
      ...g,
      label: label || "Fecha",
      total: Number(g.total || 0),
    };
  });

  const categoryChartData = (salesReport?.categorias ?? []).map((c: any) => ({
    categoria: c.categoria || "General",
    total: Number(c.total || 0),
  }));

  const detallesList = (salesReport?.detalles && salesReport.detalles.length > 0)
    ? salesReport.detalles
    : (salesReport?.ventas ?? []).map((v: any) => ({
        _id: v._id,
        cliente: v.cliente || "Consumidor Final",
        descripcion: `Venta #${String(v._id).slice(-6).toUpperCase()} - ${v.cliente || "Consumidor Final"}`,
        itemsCount: v.items?.length || 1,
        estado: v.estado || "CREADA",
        fecha: v.fecha,
        total: Number(v.total || 0),
      }));

  const [form, setForm] = useState({
    descripcion: "",
    fecha: "",
    categoria: "",
  });

  const validateReport = (data: any) => {
    if (!data.descripcion) return "La descripción es obligatoria";
    if (!data.fecha) return "La fecha es obligatoria";
    if (!data.categoria) return "La categoría es obligatoria";
    return null;
  };

  const handleDownloadReport = async (r: any) => {
    try {
      Swal.fire({
        title: `Generando reporte de ${r.categoria}...`,
        text: 'Extrayendo estadísticas y datos del sistema...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const doc = new jsPDF();
      const fechaReporte = new Date(r.fecha).toLocaleDateString("es-AR");

      // Cabecera institucional
      doc.setFillColor(16, 185, 129); // Emerald principal
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("SISTEMA MODULAR AVAPORU - INFORME OFICIAL", 14, 15);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text(`Reporte de ${r.categoria}: ${r.descripcion}`, 14, 34);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fecha del Reporte: ${fechaReporte}`, 14, 41);
      doc.text(`Generado: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`, 14, 47);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 52, 196, 52);

      let y = 60;

      // ==========================================
      // CATEGORÍA: GASTOS (EXPENSES)
      // ==========================================
      if (r.categoria === "Gastos" || r.categoria.toLowerCase().includes("gasto")) {
        const rawExpenses = await listExpenses();
        const expensesList = Array.isArray(rawExpenses) ? rawExpenses : [];

        const totalGastado = expensesList.reduce((acc: number, curr: any) => acc + Number(curr.monto || 0), 0);
        const totalPresupuesto = expensesList.reduce((acc: number, curr: any) => acc + Number(curr.presupuestoDisponible || 0), 0);
        const porcentajeEjecucion = totalPresupuesto > 0 ? ((totalGastado / totalPresupuesto) * 100).toFixed(1) : "0";

        // Cuadro de Resumen Estadístico
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, 182, 26, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 26, 2, 2, "D");

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("Total Egresos Registrados", 20, y + 8);
        doc.text("Presupuesto Asignado", 80, y + 8);
        doc.text("% Ejecución", 145, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(220, 38, 38);
        doc.text(`$${totalGastado.toLocaleString("es-AR")}`, 20, y + 18);
        doc.setTextColor(30, 41, 59);
        doc.text(`$${totalPresupuesto.toLocaleString("es-AR")}`, 80, y + 18);
        doc.setTextColor(16, 185, 129);
        doc.text(`${porcentajeEjecucion}%`, 145, y + 18);

        y += 34;

        // Desglose por Tipo de Gasto
        const categoryTotals: Record<string, number> = {};
        expensesList.forEach((e: any) => {
          const cat = e.categoria || "Otros";
          categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(e.monto || 0);
        });

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text("Distribución de Egresos por Rubro:", 14, y);
        y += 6;

        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        Object.entries(categoryTotals).forEach(([cat, amount]) => {
          const pct = totalGastado > 0 ? ((amount / totalGastado) * 100).toFixed(1) : "0";
          doc.text(`• ${cat.toUpperCase()}: $${amount.toLocaleString("es-AR")} (${pct}%)`, 18, y);
          y += 5;
        });

        y += 5;

        // Tabla de detalle de gastos
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Detalle de Movimientos de Egresos (${expensesList.length} registros):`, 14, y);
        y += 6;

        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 182, 7, "F");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Fecha", 18, y);
        doc.text("Rubro", 50, y);
        doc.text("Descripción", 85, y);
        doc.text("Monto Gastado", 155, y);
        y += 7;

        expensesList.forEach((e: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
            // Repetir cabecera de tabla
            doc.setFillColor(241, 245, 249);
            doc.rect(14, y - 4, 182, 7, "F");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text("Fecha", 18, y);
            doc.text("Rubro", 50, y);
            doc.text("Descripción", 85, y);
            doc.text("Monto Gastado", 155, y);
            y += 7;
          }
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          const fechaGasto = e.fecha ? new Date(e.fecha).toLocaleDateString("es-AR") : "-";
          doc.text(fechaGasto, 18, y);
          doc.text(String(e.categoria || "Gasto").slice(0, 16), 50, y);
          doc.text(String(e.descripcion || e.description || "-").slice(0, 35), 85, y);
          doc.text(`$${Number(e.monto || 0).toLocaleString("es-AR")}`, 155, y);
          y += 5.5;
        });

      // ==========================================
      // CATEGORÍA: VENTAS (SALES)
      // ==========================================
      } else if (r.categoria === "Ventas" || r.categoria.toLowerCase().includes("venta")) {
        const salesList = await listSales();
        const sales = Array.isArray(salesList) ? salesList : [];

        const totalVentas = sales.reduce((acc: number, curr: any) => acc + Number(curr.total || 0), 0);
        const totalOrdenes = sales.length;
        const ticketPromedio = totalOrdenes > 0 ? Math.round(totalVentas / totalOrdenes) : 0;

        // Resumen
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, 182, 26, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 26, 2, 2, "D");

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("Facturación Total", 20, y + 8);
        doc.text("Órdenes Registradas", 80, y + 8);
        doc.text("Ticket Promedio", 145, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${totalVentas.toLocaleString("es-AR")}`, 20, y + 18);
        doc.setTextColor(30, 41, 59);
        doc.text(`${totalOrdenes} ventas`, 80, y + 18);
        doc.setTextColor(79, 70, 229);
        doc.text(`$${ticketPromedio.toLocaleString("es-AR")}`, 145, y + 18);

        y += 34;

        // Detalle de ventas
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Detalle Completo de Órdenes de Venta (${sales.length} registros):`, 14, y);
        y += 6;

        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 182, 7, "F");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Cliente", 18, y);
        doc.text("Estado", 80, y);
        doc.text("Fecha", 125, y);
        doc.text("Total", 165, y);
        y += 7;

        sales.forEach((s: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
            // Repetir cabecera
            doc.setFillColor(241, 245, 249);
            doc.rect(14, y - 4, 182, 7, "F");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text("Cliente", 18, y);
            doc.text("Estado", 80, y);
            doc.text("Fecha", 125, y);
            doc.text("Total", 165, y);
            y += 7;
          }
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(String(s.cliente || "Consumidor Final").slice(0, 30), 18, y);
          doc.text(String(s.estado || "CREADA"), 80, y);
          doc.text(s.fecha ? new Date(s.fecha).toLocaleDateString("es-AR") : "-", 125, y);
          doc.text(`$${Number(s.total || 0).toLocaleString("es-AR")}`, 165, y);
          y += 5.5;
        });

      // ==========================================
      // CATEGORÍA: STOCK E INVENTARIO
      // ==========================================
      } else if (r.categoria === "Stock" || r.categoria.toLowerCase().includes("stock")) {
        const rawProducts = await listProducts();
        const products = Array.isArray(rawProducts) ? rawProducts : [];

        const totalArticulos = products.length;
        const totalUnidades = products.reduce((acc: number, curr: any) => acc + Number(curr.stockDisponible || 0), 0);
        const valorizacionTotal = products.reduce(
          (acc: number, curr: any) => acc + Number(curr.stockDisponible || 0) * Number(curr.precio || 0),
          0
        );
        const stockCriticoCount = products.filter(
          (p: any) => Number(p.stockDisponible || 0) <= Number(p.stockMinimo || 0)
        ).length;

        // Resumen
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, 182, 26, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 26, 2, 2, "D");

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("Valorización Total Inventario", 20, y + 8);
        doc.text("Unidades en Stock", 90, y + 8);
        doc.text("Artículos Críticos", 145, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${valorizacionTotal.toLocaleString("es-AR")}`, 20, y + 18);
        doc.setTextColor(30, 41, 59);
        doc.text(`${totalUnidades.toLocaleString("es-AR")} un.`, 90, y + 18);
        doc.setTextColor(220, 38, 38);
        doc.text(`${stockCriticoCount} productos`, 145, y + 18);

        y += 34;

        // Tabla de inventario
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Catálogo Completo de Artículos (${totalArticulos} productos):`, 14, y);
        y += 6;

        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 182, 7, "F");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Código", 18, y);
        doc.text("Producto", 45, y);
        doc.text("Disp.", 120, y);
        doc.text("Mín.", 138, y);
        doc.text("Precio", 155, y);
        doc.text("Valor Total", 175, y);
        y += 7;

        products.forEach((p: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
            // Repetir cabecera
            doc.setFillColor(241, 245, 249);
            doc.rect(14, y - 4, 182, 7, "F");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text("Código", 18, y);
            doc.text("Producto", 45, y);
            doc.text("Disp.", 120, y);
            doc.text("Mín.", 138, y);
            doc.text("Precio", 155, y);
            doc.text("Valor Total", 175, y);
            y += 7;
          }
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          const disp = Number(p.stockDisponible || 0);
          const min = Number(p.stockMinimo || 0);
          const precio = Number(p.precio || 0);
          doc.text(String(p.sku || "-").slice(0, 10), 18, y);
          doc.text(String(p.nombre || "").slice(0, 32), 45, y);
          doc.text(String(disp), 120, y);
          doc.text(String(min), 138, y);
          doc.text(`$${precio.toLocaleString("es-AR")}`, 155, y);
          doc.text(`$${(disp * precio).toLocaleString("es-AR")}`, 175, y);
          y += 5.5;
        });

      // ==========================================
      // CATEGORÍA: PREDICCIONES Y TENDENCIAS
      // ==========================================
      } else if (r.categoria === "Predicciones" || r.categoria.toLowerCase().includes("predicci")) {
        const sales = await listSales();
        const products = await listProducts();
        const pred = calculateSalesPredictions(sales, products, 4);

        // Resumen Predictivo
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, y, 182, 26, 2, 2, "F");
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(14, y, 182, 26, 2, 2, "D");

        doc.setFontSize(10);
        doc.setTextColor(71, 85, 105);
        doc.text("Proyección Próximo Mes", 20, y + 8);
        doc.text("Tendencia Estimada", 85, y + 8);
        doc.text("Ajuste Modelo (R²)", 145, y + 8);

        doc.setFontSize(12);
        doc.setTextColor(16, 185, 129);
        doc.text(`$${pred.proyeccionProximoMes.toLocaleString("es-AR")}`, 20, y + 18);
        doc.setTextColor(79, 70, 229);
        doc.text(`${pred.variacionPorcentualEstimada > 0 ? "+" : ""}${pred.variacionPorcentualEstimada}%`, 85, y + 18);
        doc.setTextColor(30, 41, 59);
        doc.text(`${Math.round(pred.tendenciaLineal.r2 * 100)}%`, 145, y + 18);

        y += 34;

        // Factores Estacionales
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Análisis de Estacionalidad:`, 14, y);
        y += 6;

        doc.setFontSize(9);
        doc.setTextColor(71, 85, 105);
        doc.text(`• Temporada Actual: ${pred.temporadaActual.name} (Multiplicador x${pred.temporadaActual.seasonFactor})`, 18, y);
        y += 5;
        doc.text(`• Temporada Entrante: ${pred.temporadaProxima.name} (Multiplicador x${pred.temporadaProxima.seasonFactor})`, 18, y);
        y += 5;
        doc.text(`• Recomendación Estratégica: ${pred.temporadaProxima.recommendedAction}`, 18, y);
        y += 9;

        // Artículos con mayor demanda proyectada
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(`Artículos y Categorías en Tendencia Proyectada:`, 14, y);
        y += 6;

        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 4, 182, 7, "F");
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text("Código", 18, y);
        doc.text("Producto", 45, y);
        doc.text("Categoría", 115, y);
        doc.text("Stock", 145, y);
        doc.text("Demanda Proy.", 165, y);
        y += 7;

        pred.topProductosTendencia.forEach((p: any) => {
          if (y > 270) {
            doc.addPage();
            y = 20;
            doc.setFillColor(241, 245, 249);
            doc.rect(14, y - 4, 182, 7, "F");
            doc.setFontSize(8);
            doc.setTextColor(71, 85, 105);
            doc.text("Código", 18, y);
            doc.text("Producto", 45, y);
            doc.text("Categoría", 115, y);
            doc.text("Stock", 145, y);
            doc.text("Demanda Proy.", 165, y);
            y += 7;
          }
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
          doc.text(String(p.sku || "-"), 18, y);
          doc.text(String(p.nombre || "").slice(0, 32), 45, y);
          doc.text(String(p.categoria || "General"), 115, y);
          doc.text(String(p.stockDisponible || 0), 145, y);
          doc.text(`~${p.demandaEstimada} un.`, 165, y);
          y += 5.5;
        });

      // ==========================================
      // OTRA CATEGORÍA GENERAL
      // ==========================================
      } else {
        doc.setFontSize(11);
        doc.setTextColor(30, 41, 59);
        doc.text(`Informe general de ${r.categoria} registrado en la plataforma.`, 14, y);
        y += 8;
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Identificador de Auditoría: ${r._id || "N/A"}`, 14, y);
        y += 6;
        doc.text(`Estado: Reporte validado y consolidado.`, 14, y);
      }

      doc.save(`reporte_${r.categoria.toLowerCase().replace(/\s+/g, "_")}_${new Date(r.fecha).toISOString().slice(0, 10)}.pdf`);
      Swal.close();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudo descargar el reporte con estadísticas", "error");
    }
  };

  const handleCreate = async () => {
    const error = validateReport(form);
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    const created = await createReport({
      descripcion: form.descripcion,
      fecha: new Date(form.fecha),
      categoria: form.categoria,
    });

    const result = await Swal.fire({
      icon: "success",
      title: "Reporte creado",
      text: "¿Deseas descargar el archivo PDF de este reporte ahora?",
      showCancelButton: true,
      confirmButtonText: "Descargar PDF",
      cancelButtonText: "Cerrar",
    });

    if (result.isConfirmed) {
      handleDownloadReport(created || {
        descripcion: form.descripcion,
        fecha: new Date(form.fecha),
        categoria: form.categoria,
      });
    }

    setForm({ descripcion: "", fecha: "", categoria: "" });
    listReports().then(setReportes);
  };

  const handleDelete = async (id: string) => {
    await deleteReport(id);
    Swal.fire("Eliminado", "Reporte borrado correctamente", "success");
    listReports().then(setReportes);
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.email.trim()) {
      Swal.fire("Error", "El correo electrónico es obligatorio", "error");
      return;
    }

    try {
      Swal.fire({
        title: "Programando y enviando...",
        text: `Preparando y enviando el primer reporte a ${scheduleForm.email}...`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const res = await createScheduledReport(scheduleForm);
      Swal.fire(
        "¡Reporte Programado y Enviado!",
        res.message || `El reporte fue programado con éxito y se envió la primera entrega a ${scheduleForm.email}`,
        "success"
      );
      setIsScheduleOpen(false);
      setScheduleForm({ tipo: "Ventas", frecuencia: "Diario", email: "" });
      fetchScheduledReports();
    } catch (err: any) {
      Swal.fire("Error", err?.response?.data?.error || "No se pudo programar el reporte", "error");
    }
  };

  const handleToggleSchedule = async (id: string) => {
    try {
      await toggleScheduledReport(id);
      fetchScheduledReports();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el reporte programado", "error");
    }
  };

  const handleSendScheduleNow = async (id: string) => {
    try {
      Swal.fire({
        title: "Enviando reporte...",
        text: "Generando datos y enviando correo...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      const res = await sendScheduledReportNow(id);
      Swal.fire("¡Enviado!", res.message || "Reporte enviado con éxito al correo", "success");
      fetchScheduledReports();
    } catch (err: any) {
      Swal.fire("Error", err?.response?.data?.error || "No se pudo enviar el reporte", "error");
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    const result = await Swal.fire({
      title: "¿Eliminar reporte programado?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;

    await deleteScheduledReport(id);
    fetchScheduledReports();
  };

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 min-h-screen font-sans">
        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Reportes y Análisis</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Dashboard analítico y generación de reportes</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
          <motion.button 
            onClick={() => setIsScheduleOpen(true)}
            className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            Programar Reporte
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        {/* Crear Reporte */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Crear Reporte</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Descripción"
              className="col-span-1 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            />
            <input
              type="date"
              className="border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
            <select
              className="border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              <option value="">Seleccionar Categoría</option>
              <option value="Ventas">Ventas</option>
              <option value="Gastos">Gastos</option>
              <option value="Stock">Stock e Inventario</option>
              <option value="Predicciones">Predicciones y Tendencias</option>
            </select>
          </div>
          <motion.button
            onClick={handleCreate}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            Crear Reporte
          </motion.button>
        </div>

        {/* Reportes Generados */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Reportes Generados</h2>
            </div>
            <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
              {reportes.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[160px] space-y-2 pr-2">
            {reportes.map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-slate-100">{r.descripcion}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {new Date(r.fecha).toLocaleDateString("es-ES")} • {r.categoria}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadReport(r)}
                    className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 hover:dark:text-emerald-300 transition-colors p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                    title="Descargar reporte PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 hover:dark:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {reportes.length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No hay reportes generados</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Reportes Programados */}
      <motion.div
        className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm mb-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Reportes Programados</h2>
          </div>
          <span className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">
            {scheduledReports.length}
          </span>
        </div>

        {scheduledReports.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">
            No hay reportes automáticos programados. Usá "Programar Reporte" para crear uno.
          </p>
        ) : (
          <div className="space-y-2">
            {scheduledReports.map((s) => (
              <div
                key={s._id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border ${s.activo ? "bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700" : "bg-gray-50/50 dark:bg-slate-800/50 border-gray-100 dark:border-slate-700 opacity-60"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-slate-100">
                      {s.tipo} <span className="font-normal text-gray-400 dark:text-slate-500">· {s.frecuencia}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      {s.email} {s.ultimoEnvio ? `· último envío ${new Date(s.ultimoEnvio).toLocaleString("es-AR")}` : "· sin enviar aún"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  <button
                    onClick={() => handleSendScheduleNow(s._id)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:dark:text-blue-400 transition-colors p-1.5 rounded-lg hover:bg-blue-50 hover:dark:bg-blue-900/30"
                    title="Enviar ahora"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleSchedule(s._id)}
                    className={`transition-colors p-1.5 rounded-lg ${s.activo ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 hover:dark:bg-emerald-900/30" : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 hover:dark:bg-slate-800"}`}
                    title={s.activo ? "Desactivar" : "Activar"}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSchedule(s._id)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 hover:dark:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 hover:dark:bg-red-900/30"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Divisor Dashboard Analítico */}
      <motion.div
        className="relative flex py-5 items-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
        <span className="flex-shrink-0 mx-4 text-green-600 dark:text-green-400 flex items-center gap-2 font-bold text-lg">
          <TrendingUp className="w-5 h-5" /> Dashboard Analítico
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
      </motion.div>

      <motion.div
        id="pdfArea"
        className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >

        {/* Filtros de Fecha en formato DD/MM/YYYY */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex-1">
            <DateInputDDMMYYYY
              label="Fecha desde"
              value={filterDesde}
              onChange={setFilterDesde}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <div className="flex-1">
            <DateInputDDMMYYYY
              label="Fecha hasta"
              value={filterHasta}
              onChange={setFilterHasta}
              placeholder="DD/MM/YYYY"
            />
          </div>
          <motion.button
            onClick={fetchSales}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto h-[38px] cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" /> Aplicar Filtros
          </motion.button>
        </div>

        {/* Tarjetas Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Vendido</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalVentas.toLocaleString('es-AR')}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Cantidad de Ventas</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{cantidadVentas}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-1">Total Promedio</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${cantidadVentas > 0 ? (totalVentas / cantidadVentas).toLocaleString('es-AR', { maximumFractionDigits: 2 }) : '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ventas por Día */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                <span>Ventas por Día</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {dailyChartData.length} {dailyChartData.length === 1 ? "día con actividad" : "días con actividad"}
              </span>
            </div>
            <div className="h-[240px]">
              {dailyChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                    <XAxis
                      dataKey="label"
                      stroke={chartColors.axisText}
                      tickLine={false}
                      axisLine={{ stroke: chartColors.grid }}
                      tick={{ fontSize: 11, fill: chartColors.axisText }}
                      dy={5}
                    />
                    <YAxis
                      stroke={chartColors.axisText}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: chartColors.axisText }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${Number(value || 0).toLocaleString('es-AR')}`, 'Total Vendido']}
                      labelFormatter={(_, payload: any) => {
                        const pt = payload?.[0]?.payload;
                        return pt ? `Fecha: ${pt.key || pt.label} (${pt.cantidad || 1} ventas)` : '';
                      }}
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        color: chartColors.tooltipText,
                        borderRadius: '12px',
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Sin ventas registradas en este período
                </div>
              )}
            </div>
          </div>

          {/* Ventas por Categoría */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-500" />
                <span>Ventas por Categoría</span>
              </h3>
            </div>
            <div className="h-[240px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
                    <XAxis
                      type="number"
                      stroke={chartColors.axisText}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: chartColors.axisText }}
                      tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      dataKey="categoria"
                      type="category"
                      width={90}
                      tick={{ fontSize: 11, fill: chartColors.axisText, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${Number(value || 0).toLocaleString('es-AR')}`, 'Total Categoría']}
                      contentStyle={{
                        backgroundColor: chartColors.tooltipBg,
                        color: chartColors.tooltipText,
                        borderRadius: '12px',
                        border: `1px solid ${chartColors.tooltipBorder}`,
                      }}
                    />
                    <Bar dataKey="total" fill="#3b82f6" radius={[0, 6, 6, 0]} maxBarSize={26} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Sin datos de categoría para el período
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Listado de Ventas */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Listado de Ventas</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {detallesList.length} ventas encontradas en el rango seleccionado
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <motion.button
                onClick={() => exportarPDF(salesReport, filterDesde, filterHasta)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 w-full sm:w-auto cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-3.5 h-3.5" /> Exportar PDF
              </motion.button>
              <motion.button
                onClick={() => exportarExcel(salesReport)}
                className="flex items-center justify-center gap-2 px-4 py-2 border border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-50 hover:dark:bg-emerald-900/30 transition-colors w-full sm:w-auto cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-3.5 h-3.5" /> Exportar Excel (CSV)
              </motion.button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[340px] space-y-2.5 pr-1">
            {detallesList.map((v: any, i: number) => {
              const fechaStr = v.fecha ? new Date(v.fecha).toLocaleDateString("es-AR") : "-";
              const isPaid = v.estado === "PAGADA" || v.estado === "FACTURADA";
              return (
                <div
                  key={v._id || i}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 hover:bg-slate-50 hover:dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors gap-2"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-gray-900 dark:text-slate-100">{v.cliente || "Consumidor Final"}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isPaid
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60"
                          : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60"
                      }`}>
                        {v.estado || "CREADA"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400">
                      {fechaStr} · {v.itemsCount || 1} artículo(s)
                    </p>
                  </div>

                  <span className="font-black text-sm text-emerald-600 dark:text-emerald-400 self-end sm:self-auto">
                    ${Number(v.total || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              );
            })}

            {detallesList.length === 0 && (
              <p className="text-gray-400 dark:text-slate-500 text-center py-8 text-xs font-medium">
                No hay ventas registradas en el período seleccionado.
              </p>
            )}
          </div>
        </div>

      </motion.div>

      {/* MODAL PROGRAMAR REPORTES */}
      <AnimatePresence>
        {isScheduleOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">Programar Reporte</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Recibe reportes automáticos en tu correo.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Tipo de Reporte</label>
                  <select 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50"
                    value={scheduleForm.tipo}
                    onChange={(e) => setScheduleForm({...scheduleForm, tipo: e.target.value})}
                  >
                    <option>Ventas</option>
                    <option>Gastos</option>
                    <option>Inventario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Frecuencia</label>
                  <select 
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50"
                    value={scheduleForm.frecuencia}
                    onChange={(e) => setScheduleForm({...scheduleForm, frecuencia: e.target.value})}
                  >
                    <option>Diario</option>
                    <option>Semanal</option>
                    <option>Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Correo Electrónico</label>
                  <input 
                    type="email"
                    placeholder="tu@correo.com"
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50"
                    value={scheduleForm.email}
                    onChange={(e) => setScheduleForm({...scheduleForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button 
                  onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl py-2.5 font-semibold hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  onClick={handleCreateSchedule}
                  className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Confirmar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

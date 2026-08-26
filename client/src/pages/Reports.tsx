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
import html2canvas from "html2canvas-pro";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

interface VentaDetalle {
  descripcion: string;
  total: number;
  fecha: string;
}

const exportarPDF = async () => {
  const element = document.getElementById("pdfArea");
  if (!element) return;

  Swal.fire({
    title: 'Generando PDF...',
    text: 'Por favor espera un momento',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("landscape", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`reporte_ventas_${new Date().toLocaleDateString()}.pdf`);
    Swal.close();
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "No se pudo generar el PDF", "error");
  }
};

const exportarExcel = (salesReport: any) => {
  if (!salesReport || !salesReport.ventas) {
    Swal.fire("Info", "No hay datos para exportar", "info");
    return;
  }
  
  const headers = ["Fecha", "Total", "Cliente"];
  const rows = salesReport.ventas.map((v: any) => [
    new Date(v.fecha).toLocaleDateString(),
    v.total,
    v.cliente || "Consumidor Final"
  ]);
  
  const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ventas_${new Date().toLocaleDateString()}.csv`);
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

  const handleCreate = async () => {
    const error = validateReport(form);
    if (error) {
      Swal.fire("Error", error, "error");
      return;
    }

    await createReport({
      descripcion: form.descripcion,
      fecha: new Date(form.fecha),
      categoria: form.categoria,
    });

    Swal.fire("Éxito", "Reporte creado", "success");
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
      await createScheduledReport(scheduleForm);
      Swal.fire("Programado", "El reporte automático fue programado exitosamente", "success");
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
      const res = await sendScheduledReportNow(id);
      Swal.fire("Enviado", res.message || "Reporte enviado", "success");
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
            className="px-5 py-2.5 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded-xl font-semibold hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            Programar Reporte
          </motion.button>
          <motion.button 
            onClick={exportarPDF}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto cursor-pointer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" /> Exportar Dashboard
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
              <option value="">Categoría</option>
              <option value="Ventas">Ventas</option>
              <option value="Gastos">Gastos</option>
              <option value="Stock">Stock</option>
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
                <button
                  onClick={() => handleDelete(r._id)}
                  className="text-red-500 dark:text-red-400 hover:text-red-700 hover:dark:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
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

        {/* Filtros de Fecha */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end bg-gray-50 dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha desde</label>
            <input
              type="date"
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              value={filterDesde}
              onChange={(e) => setFilterDesde(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha hasta</label>
            <input
              type="date"
              className="border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
              value={filterHasta}
              onChange={(e) => setFilterHasta(e.target.value)}
            />
          </div>
          <motion.button
            onClick={fetchSales}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto h-[42px] cursor-pointer"
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
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">Ventas por Día</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.grafico ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Ventas']}
                    labelFormatter={(label: string) => `Fecha: ${label}`}
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipText, borderRadius: '8px', border: `1px solid ${chartColors.tooltipBorder}` }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <XAxis dataKey={(e) => new Date(e.fecha).toLocaleDateString("es-ES")} hide />
                  <YAxis hide />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 mb-4">Ventas por Categoría</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.categorias ?? []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartColors.grid} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="categoria" type="category" width={80} tick={{ fontSize: 12, fill: chartColors.axisText }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: number) => [`$${value.toLocaleString('es-AR')}`, 'Ventas']}
                    contentStyle={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipText, borderRadius: '8px', border: `1px solid ${chartColors.tooltipBorder}` }}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Listado de Ventas */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100">Listado de Ventas</h3>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-4 sm:mt-0">
              <motion.button
                onClick={exportarPDF}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25 w-full sm:w-auto cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" /> Exportar PDF
              </motion.button>
              <motion.button
                onClick={() => exportarExcel(salesReport)}
                className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-emerald-500 text-emerald-800 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-50 hover:dark:bg-emerald-900/30 transition-colors w-full sm:w-auto cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" /> Exportar Excel (CSV)
              </motion.button>
            </div>
          </div>
          
          <div className="overflow-y-auto max-h-[300px] space-y-2">
            {(salesReport?.detalles ?? []).map((v: VentaDetalle, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 hover:dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 last:border-0 rounded-lg transition-colors">
                <div>
                  <p className="font-medium text-gray-800 dark:text-slate-100">{v.descripcion}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {new Date(v.fecha).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  ${v.total.toLocaleString('es-AR')}
                </span>
              </div>
            ))}
            {(!salesReport?.detalles || salesReport.detalles.length === 0) && (
              <p className="text-gray-400 dark:text-slate-500 text-center py-6 text-sm">No hay ventas registradas en este período</p>
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

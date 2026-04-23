import { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  Download,
  Calendar,
  BarChart3,
  FileBarChart,
} from "lucide-react";
import { useEffect } from "react";
import { createReport, deleteReport, getSalesReport, listReports } from "../services/reportService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

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
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const fetchSales = async () => {
    const data = await getSalesReport(filterDesde, filterHasta);
    setSalesReport(data);
  };

  useEffect(() => {
    fetchSales();
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

  useEffect(() => {
  listReports().then(setReportes);
  }, []);

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

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };


  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col gap-8 font-sans">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Reportes y Análisis
            </h1>
          </div>
          <p className="text-lg text-slate-500 font-medium mt-2">
            Dashboard analítico y generación de reportes
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button 
            onClick={() => setIsScheduleOpen(true)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 flex items-center hover:bg-slate-50 transition-colors font-medium"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Programar Reportes
          </motion.button>
          <motion.button 
            onClick={exportarPDF}
            className="bg-emerald-500 text-white rounded-xl px-4 py-2.5 flex items-center hover:bg-emerald-600 transition-colors font-semibold shadow-sm"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar Dashboard
          </motion.button>
        </div>
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
          <div className="p-1.5 bg-emerald-100 rounded-lg">
            <FileBarChart className="w-4 h-4 text-emerald-600" />
          </div>
          Crear Reporte
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Descripción"
            className="border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <input
            type="date"
            className="border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />

          <select
            className="border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            <option value="">Categoría</option>
            <option value="ventas">Ventas</option>
            <option value="gastos">Gastos</option>
            <option value="inventario">Inventario</option>
          </select>
        </div>

        <motion.button
          onClick={handleCreate}
          className="mt-4 bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-semibold shadow-sm"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Crear Reporte
        </motion.button>
      </motion.div>

      <motion.div 
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
          <h3 className="text-lg font-bold mb-3">Reportes Generados</h3>

          <AnimatePresence>
            {reportes.map((r) => (
              <motion.div 
                key={r._id} 
                className="border border-slate-200 p-4 rounded-xl mb-2 flex justify-between items-center hover:shadow-sm transition-all bg-slate-50/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <div>
                  <p className="font-semibold">{r.descripcion}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(r.fecha).toLocaleDateString("es-ES")}
                  </p>
                  <p className="text-xs text-gray-500">Categoría: {r.categoria}</p>
                </div>

                <motion.button
                  onClick={() => handleDelete(r._id)}
                  className="text-red-600 hover:text-red-800 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Eliminar
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>



      {/* Tabs */}
      <div>
        <div className="grid grid-cols-1 border-b border-slate-200">
          {["dashboard"].map((tab) => (
            <button
              key={tab}
              className={'py-2.5 text-center font-semibold transition-colors ' + (
                activeTab === tab
                  ? "border-b-2 border-emerald-600 text-emerald-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "dashboard"
                ? "Dashboard Analítico"
                : tab === "reports"}
            </button>
          ))}
        </div>


      
      {/* DASHBOARD ANALÍTICO */}
      {activeTab === "dashboard" && (
  <motion.div 
    className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-4"
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >

    {/* FILTROS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="text-sm font-medium text-slate-700">Fecha desde</label>
        <input
          type="date"
          className="border border-slate-200 rounded-lg p-2.5 w-full bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          value={filterDesde}
          onChange={(e) => setFilterDesde(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Fecha hasta</label>
        <input
          type="date"
          className="border border-slate-200 rounded-lg p-2.5 w-full bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          value={filterHasta}
          onChange={(e) => setFilterHasta(e.target.value)}
        />
      </div>

      <motion.button
        onClick={fetchSales}
        className="bg-emerald-500 text-white rounded-xl px-4 py-2.5 mt-6 hover:bg-emerald-600 transition-colors font-semibold shadow-sm"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        Aplicar Filtros
      </motion.button>
    </div>


  <div id="pdfArea" className="w-full mx-auto bg-white p-10 rounded-2xl shadow-sm">

    {/* KPIs */}
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >

      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 font-medium">Total Vendido</p>
            <p className="text-3xl font-bold text-emerald-600">
              ${totalVentas.toLocaleString() || 0 }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 font-medium">Cantidad de Ventas</p>
            <p className="text-3xl font-bold">{cantidadVentas}</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
          <CardContent className="p-6">
            <p className="text-sm text-slate-500 font-medium">Ticket Promedio</p>
            <p className="text-3xl font-bold text-blue-600">
              ${cantidadVentas > 0 ? (totalVentas / cantidadVentas).toFixed(2) : '0.00'}
            </p>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>

    {/* GRÁFICOS */}
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
    >

      {/* BARRAS */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-sm rounded-xl border border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
              </div>
              Ventas por Día
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.grafico ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey={(e) => new Date(e.fecha).toLocaleDateString("es-ES")} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* TORTA O BARRAS POR CATEGORÍA */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white shadow-sm rounded-xl border border-slate-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              Ventas por Categoría
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesReport?.categorias ?? []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="categoria" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>

    {/* TABLA DE VENTAS */}
    <motion.div 
      className="mt-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Card className="bg-white shadow-sm rounded-xl border border-slate-100">
        <CardHeader>
          <CardTitle>Listado de Ventas</CardTitle>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-80">
          {(salesReport?.detalles ?? []).map((v: VentaDetalle, i: number) => (
            <motion.div 
              key={i} 
              className="border border-slate-200 rounded-xl p-3 mb-2 hover:shadow-sm transition-all bg-slate-50/30"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex justify-between">
                <p>{v.descripcion}</p>
                <span className="font-bold text-green-600">
                  ${v.total.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-gray-600">
                {new Date(v.fecha).toLocaleDateString("es-ES")}
              </p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </motion.div>

    {/* BOTONES EXPORTAR */}
    <div className="flex gap-4 mt-6">
      <motion.button
        onClick={exportarPDF}
        className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 transition-colors font-semibold shadow-sm flex items-center gap-2"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Download className="w-4 h-4" /> Exportar PDF
      </motion.button>

      <motion.button
        onClick={() => exportarExcel(salesReport)}
        className="bg-blue-500 text-white px-5 py-2.5 rounded-xl hover:bg-blue-600 transition-colors font-semibold shadow-sm flex items-center gap-2"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <FileBarChart className="w-4 h-4" /> Exportar Excel (CSV)
      </motion.button>
    </div>

        
           </div>
        </motion.div>
      )}
      </div>

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
              className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Programar Reporte</h2>
              <p className="text-gray-600 mb-6">Recibe reportes automáticos en tu correo.</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Reporte</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50"
                    value={scheduleForm.tipo}
                    onChange={(e) => setScheduleForm({...scheduleForm, tipo: e.target.value})}
                  >
                    <option>Ventas</option>
                    <option>Gastos</option>
                    <option>Inventario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                  <select 
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50"
                    value={scheduleForm.frecuencia}
                    onChange={(e) => setScheduleForm({...scheduleForm, frecuencia: e.target.value})}
                  >
                    <option>Diario</option>
                    <option>Semanal</option>
                    <option>Mensual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input 
                    type="email"
                    placeholder="tu@correo.com"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50/50"
                    value={scheduleForm.email}
                    onChange={(e) => setScheduleForm({...scheduleForm, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setIsScheduleOpen(false)}
                  className="flex-1 border border-slate-300 rounded-xl py-2.5 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    Swal.fire("Programado", "Reporte programado exitosamente", "success");
                    setIsScheduleOpen(false);
                  }}
                  className="flex-1 bg-emerald-500 text-white rounded-xl py-2.5 font-semibold hover:bg-emerald-600 transition-colors shadow-sm"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

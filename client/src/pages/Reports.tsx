import { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  Download,
  Calendar,
} from "lucide-react";
import { useEffect } from "react";
import { createReport, deleteReport, getSalesReport, listReports } from "../services/reportService";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

interface VentaDetalle {
  descripcion: string;
  total: number;
  fecha: string;
}



const exportarPDF = async () => {
  const element = document.getElementById("pdfArea");
  if (!element) return;

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
  pdf.save("reporte_ventas.pdf");
};


export function ReportsModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reportes, setReportes] = useState<any[]>([]);
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
const ticketPromedio = cantidadVentas > 0 ? (totalVentas / cantidadVentas).toFixed(2) : 0;

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


  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reportes y Análisis
          </h1>
          <p className="text-gray-600 mt-1">
            Dashboard analítico y generación de reportes
          </p>
        </div>
        <div className="flex gap-2">
          <button className="border rounded-md px-3 py-2 flex items-center hover:bg-gray-100">
            <Calendar className="w-4 h-4 mr-2" />
            Programar Reportes
          </button>
          <button className="bg-green-600 text-white rounded-md px-3 py-2 flex items-center hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-bold mb-3">Crear Reporte</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <input
            type="text"
            placeholder="Descripción"
            className="border p-2 rounded"
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          <input
            type="date"
            className="border p-2 rounded"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />

          <select
            className="border p-2 rounded"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            <option value="">Categoría</option>
            <option value="ventas">Ventas</option>
            <option value="gastos">Gastos</option>
            <option value="inventario">Inventario</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Crear Reporte
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-3">Reportes Generados</h3>

          {reportes.map((r) => (
            <div key={r._id} className="border p-3 rounded mb-2 flex justify-between">
              <div>
                <p className="font-semibold">{r.descripcion}</p>
                <p className="text-sm text-gray-600">
                  {new Date(r.fecha).toLocaleDateString("es-ES")}
                </p>
                <p className="text-xs text-gray-500">Categoría: {r.categoria}</p>
              </div>

              <button
                onClick={() => handleDelete(r._id)}
                className="text-red-600 hover:text-red-800"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>



      {/* Tabs */}
      <div>
        <div className="grid grid-cols-1 border-b">
          {["dashboard"].map((tab) => (
            <button
              key={tab}
              className={`py-2 text-center font-semibold ${
                activeTab === tab
                  ? "border-b-2 border-green-600 text-green-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
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
  <div className="space-y-6 bg-white p-4 rounded-lg shadow">

    {/* FILTROS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="text-sm font-medium">Fecha desde</label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={filterDesde}
          onChange={(e) => setFilterDesde(e.target.value)}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Fecha hasta</label>
        <input
          type="date"
          className="border rounded p-2 w-full"
          value={filterHasta}
          onChange={(e) => setFilterHasta(e.target.value)}
        />
      </div>

      <button
        onClick={fetchSales}
        className="bg-green-600 text-white rounded px-4 py-2 mt-6 hover:bg-green-700"
      >
        Aplicar Filtros
      </button>
    </div>


  <div id="pdfArea"  className="w-full mx-auto bg-white p-10 rounded-lg shadow ">

    {/* KPIs */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">Total Vendido</p>
          <p className="text-3xl font-bold text-green-600">
            ${totalVentas.toLocaleString() || 0 }
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">Cantidad de Ventas</p>
          <p className="text-3xl font-bold">{cantidadVentas}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">Ticket Promedio</p>
          <p className="text-3xl font-bold text-blue-600">
            ${(totalVentas / cantidadVentas).toFixed(2)}
          </p>
        </CardContent>
      </Card>

    </div>

    {/* GRÁFICOS */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* BARRAS */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Día</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.grafico ?? []}>
                <XAxis dataKey={(e) => new Date(e.fecha).toLocaleDateString("es-ES")} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* TORTA O BARRAS POR CATEGORÍA */}
      <Card>
        <CardHeader>
          <CardTitle>Ventas por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.categorias ?? []}>
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

    </div>

    {/* TABLA DE VENTAS */}
    <Card>
      <CardHeader>
        <CardTitle>Listado de Ventas</CardTitle>
      </CardHeader>

      <CardContent className="overflow-y-auto max-h-80">
        {(salesReport?.detalles ?? []).map((v: VentaDetalle, i: number) => (
          <div key={i} className="border rounded p-3 mb-2">
            <div className="flex justify-between">
              <p>{v.descripcion}</p>
              <span className="font-bold text-green-600">
                ${v.total.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-600">
              {new Date(v.fecha).toLocaleDateString("es-ES")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* BOTÓN PDF */}
    <button
      onClick={exportarPDF}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      Exportar PDF
    </button>

        
           </div>
        </div>
      )}
      </div>
    </div>
  );
}

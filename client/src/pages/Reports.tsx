import React, { useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Search,
  Eye,
  Mail,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

interface User {
  nombre: string;
  email: string;
  role: string;
}

interface ReportsModuleProps {
  user: User;
}

interface Report {
  id: string;
  name: string;
  description: string;
  type: "sales" | "inventory" | "financial" | "customer";
  lastGenerated: string;
  size: string;
  format: "pdf" | "excel" | "csv";
}

const salesData = [
  { month: "Ene", sales: 850000, orders: 125, profit: 280000 },
  { month: "Feb", sales: 920000, orders: 142, profit: 315000 },
  { month: "Mar", sales: 780000, orders: 118, profit: 245000 },
  { month: "Abr", sales: 1150000, orders: 168, profit: 395000 },
  { month: "May", sales: 1280000, orders: 195, profit: 445000 },
  { month: "Jun", sales: 1420000, orders: 218, profit: 510000 },
];

const categoryDistribution = [
  { name: "Deportivas", value: 45 },
  { name: "Urbanas", value: 35 },
  { name: "Accesorios", value: 20 },
];

const predefinedReports: Report[] = [
  {
    id: "1",
    name: "Reporte de Ventas Mensual",
    description:
      "Análisis completo de ventas, productos más vendidos y tendencias del mes",
    type: "sales",
    lastGenerated: "2024-09-08",
    size: "2.4 MB",
    format: "pdf",
  },
  {
    id: "2",
    name: "Estado de Inventario",
    description: "Stock actual, productos críticos y valorización del inventario",
    type: "inventory",
    lastGenerated: "2024-09-07",
    size: "1.8 MB",
    format: "excel",
  },
  {
    id: "3",
    name: "Balance Financiero",
    description: "Ingresos, gastos, márgenes y flujo de efectivo del período",
    type: "financial",
    lastGenerated: "2024-09-06",
    size: "3.2 MB",
    format: "pdf",
  },
  {
    id: "4",
    name: "Análisis de Clientes",
    description:
      "Clientes frecuentes, tickets promedio y segmentación por compras",
    type: "customer",
    lastGenerated: "2024-09-05",
    size: "1.5 MB",
    format: "excel",
  },
];

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

export function ReportsModule() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [reportType, setReportType] = useState("all");

  // 🔔 Helpers con SweetAlert2
  const showSuccess = (msg: string) =>
    Swal.fire({
      icon: "success",
      title: "Éxito",
      text: msg,
      confirmButtonColor: "#10b981",
      timer: 2200,
      showConfirmButton: false,
    });

  const showInfo = (msg: string) =>
    Swal.fire({
      icon: "info",
      title: "Información",
      text: msg,
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      showConfirmButton: false,
    });

  const showLoading = async (msg: string, callback: () => void) => {
    Swal.fire({
      title: msg,
      didOpen: () => Swal.showLoading(),
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
    });
    setTimeout(() => {
      Swal.close();
      callback();
    }, 1500);
  };

  const generateReport = () =>
    showLoading("Generando reporte...", () =>
      showSuccess("Reporte generado exitosamente 🚀")
    );

  const downloadReport = () =>
    showLoading("Descargando reporte...", () =>
      showInfo("Descarga completada 💾")
    );

  const emailReport = () =>
    showLoading("Enviando por email...", () =>
      showSuccess("Reporte enviado 📧")
    );

  const filteredReports = predefinedReports.filter(
    (report) => reportType === "all" || report.type === reportType
  );

  const getReportIcon = (type: string) => {
    const iconProps = "w-5 h-5";
    switch (type) {
      case "sales":
        return <TrendingUp className={`${iconProps} text-green-500`} />;
      case "inventory":
        return <Package className={`${iconProps} text-blue-500`} />;
      case "financial":
        return <DollarSign className={`${iconProps} text-yellow-500`} />;
      case "customer":
        return <Users className={`${iconProps} text-purple-500`} />;
      default:
        return <FileText className={`${iconProps} text-gray-500`} />;
    }
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

      {/* Tabs */}
      <div>
        <div className="grid grid-cols-3 border-b">
          {["dashboard", "reports", "custom"].map((tab) => (
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
                : tab === "reports"
                ? "Reportes Predefinidos"
                : "Reportes Personalizados"}
            </button>
          ))}
        </div>

        {activeTab === "reports" && (
          <div className="mt-6 space-y-6">
            {/* Filtro */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-green-600" />
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="border rounded-md px-3 py-2"
              >
                <option value="all">Todos los reportes</option>
                <option value="sales">Ventas</option>
                <option value="inventory">Inventario</option>
                <option value="financial">Financiero</option>
                <option value="customer">Clientes</option>
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  className="border rounded-md pl-10 pr-3 py-2 w-full"
                />
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 hover:border-green-500 transition"
                >
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      {getReportIcon(report.type)}
                      <div>
                        <h4 className="font-semibold">{report.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.description}
                        </p>
                      </div>
                    </div>
                    <span className="border rounded-full px-3 py-1 text-xs text-gray-600 capitalize">
                      {report.type}
                    </span>
                  </div>

                  <div className="mt-3 text-sm text-gray-700 space-y-1">
                    <p>
                      Última generación:{" "}
                      {new Date(report.lastGenerated).toLocaleDateString("es-ES")}
                    </p>
                    <p>Tamaño: {report.size}</p>
                    <p>Formato: {report.format.toUpperCase()}</p>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={generateReport}
                      className="flex-1 bg-green-600 text-white py-1 rounded-md flex items-center justify-center hover:bg-green-700"
                    >
                      <FileText className="w-4 h-4 mr-1" /> Generar
                    </button>
                    <button
                      onClick={downloadReport}
                      className="border rounded-md p-2 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={emailReport}
                      className="border rounded-md p-2 hover:bg-gray-100"
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="border rounded-md p-2 hover:bg-gray-100">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

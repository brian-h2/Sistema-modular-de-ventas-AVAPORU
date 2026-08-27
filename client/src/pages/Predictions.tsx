import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Sparkles,
  TrendingUp,
  Sun,
  CloudSun,
  Snowflake,
  Leaf,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Search,
} from "lucide-react";
import { motion } from "framer-motion";
import jsPDF from "jspdf";
import Swal from "sweetalert2";

import { Card } from "../components/ui/Card";
import { useTheme } from "../context/ThemeContext";
import { listSales } from "../services/salesServices";
import { listProducts } from "../services/productsService";
import { calculateSalesPredictions, type PredictionResult } from "../utils/salesPredictionEngine";

interface PredictionsProps {
  sales?: any[];
  products?: any[];
  isEmbedded?: boolean;
}

export default function Predictions({ sales: propSales, products: propProducts, isEmbedded = false }: PredictionsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [sales, setSales] = useState<any[]>(propSales || []);
  const [products, setProducts] = useState<any[]>(propProducts || []);
  const [loading, setLoading] = useState(false);
  const [forecastHorizon, setForecastHorizon] = useState<number>(4); // 3, 4, 6 o 12 meses
  const [productFilter, setProductFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("TODAS");

  const chartColors = {
    grid: isDark ? "#334155" : "#e2e8f0",
    axisText: isDark ? "#94a3b8" : "#64748b",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipText: isDark ? "#e2e8f0" : "#1e293b",
    primary: "#4f46e5",
    forecast: "#10b981",
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [salesData, productsData] = await Promise.all([listSales(), listProducts()]);
      setSales(Array.isArray(salesData) ? salesData : []);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudieron cargar los datos para las predicciones", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propSales && propSales.length > 0) {
      setSales(propSales);
    }
    if (propProducts && propProducts.length > 0) {
      setProducts(propProducts);
    }
    if ((!propSales || propSales.length === 0) && (!propProducts || propProducts.length === 0)) {
      fetchData();
    }
  }, [propSales, propProducts]);

  const prediction: PredictionResult = useMemo(() => {
    return calculateSalesPredictions(sales, products, forecastHorizon);
  }, [sales, products, forecastHorizon]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.categoria) set.add(p.categoria);
    });
    return ["TODAS", ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return prediction.topProductosTendencia.filter((p) => {
      const matchesText =
        p.nombre.toLowerCase().includes(productFilter.toLowerCase()) ||
        p.sku.toLowerCase().includes(productFilter.toLowerCase());
      const matchesCat = categoryFilter === "TODAS" || p.categoria === categoryFilter;
      return matchesText && matchesCat;
    });
  }, [prediction, productFilter, categoryFilter]);

  // Estaciones del año
  const seasonsData = [
    {
      name: "Verano",
      months: "Dic - Feb",
      icon: Sun,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      multiplier: "x1.25 (+25%)",
      focus: "Calzado liviano, sandalias, zapatillas urbanas y accesorios de viaje.",
      isActive: prediction.temporadaActual.name === "Verano",
      isNext: prediction.temporadaProxima.name === "Verano",
    },
    {
      name: "Otoño",
      months: "Mar - May",
      icon: Leaf,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10 border-orange-500/30",
      multiplier: "x1.05 (+5%)",
      focus: "Calzado deportivo, zapatillas escolares y mochilas urbanas.",
      isActive: prediction.temporadaActual.name === "Otoño",
      isNext: prediction.temporadaProxima.name === "Otoño",
    },
    {
      name: "Invierno",
      months: "Jun - Ago",
      icon: Snowflake,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/30",
      multiplier: "x1.18 (+18%)",
      focus: "Botas, calzado térmico y cerrado, accesorios de abrigo.",
      isActive: prediction.temporadaActual.name === "Invierno",
      isNext: prediction.temporadaProxima.name === "Invierno",
    },
    {
      name: "Primavera",
      months: "Sep - Nov",
      icon: CloudSun,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      multiplier: "x1.15 (+15%)",
      focus: "Zapatillas running, calzado deportivo y accesorios outdoor.",
      isActive: prediction.temporadaActual.name === "Primavera",
      isNext: prediction.temporadaProxima.name === "Primavera",
    },
  ];

  // Exportar PDF Ejecutivo de Predicciones
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 24, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("SISTEMA AVAPORU - INFORME PREDICTIVO & TENDENCIAS", 14, 15);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(13);
      doc.text(`Proyección de Demanda Estacional (Horizonte: ${forecastHorizon} meses)`, 14, 34);

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString("es-AR")} ${new Date().toLocaleTimeString("es-AR")}`, 14, 41);

      doc.setDrawColor(226, 232, 240);
      doc.line(14, 46, 196, 46);

      let y = 56;

      // KPIs
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, 182, 26, 2, 2, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, y, 182, 26, 2, 2, "D");

      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text("Proyección Próx. Mes", 20, y + 8);
      doc.text("Temporada Próxima", 85, y + 8);
      doc.text("Ajuste Regresión (R²)", 145, y + 8);

      doc.setFontSize(12);
      doc.setTextColor(16, 185, 129);
      doc.text(`$${prediction.proyeccionProximoMes.toLocaleString("es-AR")}`, 20, y + 18);
      doc.setTextColor(79, 70, 229);
      doc.text(`${prediction.temporadaProxima.name} (x${prediction.temporadaProxima.seasonFactor})`, 85, y + 18);
      doc.setTextColor(30, 41, 59);
      doc.text(`${Math.round(prediction.tendenciaLineal.r2 * 100)}%`, 145, y + 18);

      y += 36;

      // Tabla de proyección mensual
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Cronograma de Proyecciones Mensuales:", 14, y);
      y += 6;

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 4, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("Mes", 18, y);
      doc.text("Tipo de Dato", 80, y);
      doc.text("Monto / Facturación Proyectada", 135, y);
      y += 7;

      prediction.timeline.forEach((pt) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(30, 41, 59);
        doc.text(pt.label, 18, y);
        doc.text(pt.isProjection ? "Proyección Predictiva" : "Histórico Real", 80, y);
        const monto = pt.isProjection ? pt.proyeccion : pt.historico;
        doc.text(`$${Number(monto || 0).toLocaleString("es-AR")}`, 135, y);
        y += 5.5;
      });

      y += 8;

      // Artículos sugeridos para compra
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Artículos y Categorías con Mayor Demanda Estimada:", 14, y);
      y += 6;

      doc.setFillColor(241, 245, 249);
      doc.rect(14, y - 4, 182, 7, "F");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("SKU", 18, y);
      doc.text("Producto", 45, y);
      doc.text("Categoría", 115, y);
      doc.text("Stock Disp.", 145, y);
      doc.text("Demanda Est.", 170, y);
      y += 7;

      prediction.topProductosTendencia.forEach((p) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
        }
        doc.setTextColor(30, 41, 59);
        doc.text(p.sku, 18, y);
        doc.text(p.nombre.slice(0, 30), 45, y);
        doc.text(p.categoria, 115, y);
        doc.text(String(p.stockDisponible), 145, y);
        doc.text(`~${p.demandaEstimada} un.`, 170, y);
        y += 5.5;
      });

      doc.save(`informe_predictivo_${new Date().toISOString().slice(0, 10)}.pdf`);
      Swal.fire("Descargado", "Informe predictivo generado exitosamente", "success");
    } catch (e) {
      console.error(e);
      Swal.fire("Error", "No se pudo generar el PDF predictivo", "error");
    }
  };

  return (
    <div
      className={
        isEmbedded
          ? "flex flex-col gap-6 font-sans w-full"
          : "p-4 sm:p-8 bg-gradient-to-br from-slate-50 dark:from-slate-950 to-slate-100 dark:to-slate-900 min-h-screen font-sans flex flex-col gap-6"
      }
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Predicciones & Tendencias
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Modelo analítico de Regresión Lineal + Estacionalidad de Ventas por Temporada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selector de horizonte */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Horizonte:</span>
            <select
              value={forecastHorizon}
              onChange={(e) => setForecastHorizon(Number(e.target.value))}
              className="text-xs font-bold bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value={3}>3 meses</option>
              <option value={4}>4 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold transition-all shadow-xs"
            title="Recalcular modelo"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Recalcular</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Informe PDF</span>
          </button>
        </div>
      </motion.div>

      {/* Tarjetas de Métricas Predictivas Principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Proyección Próximo Mes */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Proyección Próx. Mes</span>
            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-lg ${
                prediction.variacionPorcentualEstimada >= 0
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
              }`}
            >
              {prediction.variacionPorcentualEstimada >= 0 ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {prediction.variacionPorcentualEstimada > 0 ? "+" : ""}
              {prediction.variacionPorcentualEstimada}%
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            ${prediction.proyeccionProximoMes.toLocaleString("es-AR")}
          </p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
            Tendencia lineal × Multiplicador estacional
          </p>
        </Card>

        {/* Temporada Actual vs Entrante */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Temporada Entrante</span>
            <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-lg">
              x{prediction.temporadaProxima.seasonFactor}
            </span>
          </div>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {prediction.temporadaProxima.name}
          </p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
            {prediction.temporadaProxima.description}
          </p>
        </Card>

        {/* Ajuste del Modelo R^2 */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Ajuste Estadístico (R²)</span>
            <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg">
              Alta Confiabilidad
            </span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {Math.round(prediction.tendenciaLineal.r2 * 100)}%
          </p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
            Pendiente m = ${prediction.tendenciaLineal.pendiente.toLocaleString("es-AR")}/mes
          </p>
        </Card>

        {/* Artículos en Riesgo de Stock */}
        <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Alertas de Stock</span>
            <span className="p-1 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {prediction.topProductosTendencia.filter((p) => p.necesitaReposicion).length} sugerencias
          </p>
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1">
            Artículos con stock inferior a la demanda proyectada
          </p>
        </Card>
      </div>

      {/* Gráfico Principal de Predicción */}
      <Card className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span>Curva de Facturación Histórica y Proyección a Futuro</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Transición de ventas reales hacia los próximos {forecastHorizon} meses estimados
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <span className="w-3.5 h-3.5 rounded-full bg-indigo-600"></span>
              Histórico Real
            </span>
            <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="w-4 h-1.5 border-b-2 border-dashed border-emerald-500"></span>
              Proyección Estacional
            </span>
          </div>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prediction.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHistoricoFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorProyeccionFull" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartColors.axisText, fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: chartColors.axisText, fontSize: 11 }}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                dx={-10}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltipBg,
                  color: chartColors.tooltipText,
                  borderRadius: "14px",
                  border: "none",
                  boxShadow: "0 10px 20px -5px rgb(0 0 0 / 0.15)",
                }}
                formatter={(value: any, name: any) => [
                  `$${Number(value || 0).toLocaleString("es-AR")}`,
                  name === "historico" ? "Ventas Reales" : "Proyección Estacional",
                ]}
              />
              <Area
                type="monotone"
                dataKey="historico"
                stroke="#4f46e5"
                strokeWidth={3}
                fill="url(#colorHistoricoFull)"
                activeDot={{ r: 6, fill: "#4f46e5" }}
              />
              <Area
                type="monotone"
                dataKey="proyeccion"
                stroke="#10b981"
                strokeWidth={3}
                strokeDasharray="4 4"
                fill="url(#colorProyeccionFull)"
                activeDot={{ r: 6, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cuadrícula de Estaciones del Año y Factores Estacionales */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <span>Matriz de Estacionalidad por Temporada</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {seasonsData.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.name}
                className={`p-5 rounded-2xl border transition-all ${
                  s.isActive
                    ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/20"
                    : s.isNext
                    ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-5 h-5 ${s.color}`} />
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {s.name}
                    </span>
                  </div>

                  {s.isActive && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                      Actual
                    </span>
                  )}
                  {s.isNext && !s.isActive && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      Entrante
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Meses activos:</span>
                    <strong className="text-slate-700 dark:text-slate-300">{s.months}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Impacto ventas:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{s.multiplier}</strong>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
                    {s.focus}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabla de Artículos en Tendencia y Reposición de Inventario */}
      <Card className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-emerald-500" />
              <span>Proyección de Demanda por Artículo y Sugerencia de Stock</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Anticipa la compra de inventario según la demanda esperada para la temporada entrante
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Buscador de producto */}
            <div className="relative min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar artículo..."
                value={productFilter}
                onChange={(e) => setProductFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Filtro categoría */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 px-3">Código</th>
                <th className="pb-3 px-3">Producto</th>
                <th className="pb-3 px-3">Categoría</th>
                <th className="pb-3 px-3 text-right">Precio</th>
                <th className="pb-3 px-3 text-center">Stock Actual</th>
                <th className="pb-3 px-3 text-center">Demanda Estimada</th>
                <th className="pb-3 px-3 text-center">Diagnóstico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredProducts.map((p) => (
                <tr
                  key={p.sku}
                  className="hover:bg-slate-50/80 hover:dark:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-indigo-600 dark:text-indigo-400">{p.sku}</td>
                  <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{p.nombre}</td>
                  <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{p.categoria}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                    ${Number(p.precio || 0).toLocaleString("es-AR")}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                    {p.stockDisponible} un.
                  </td>
                  <td className="py-3 px-3 text-center font-black text-emerald-600 dark:text-emerald-400">
                    ~{p.demandaEstimada} un.
                  </td>
                  <td className="py-3 px-3 text-center">
                    {p.necesitaReposicion ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-900/60">
                        <AlertTriangle className="w-3 h-3" /> Reponer Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60">
                        <CheckCircle2 className="w-3 h-3" /> Cobertura OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400">
                    No se encontraron artículos que coincidan con la búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

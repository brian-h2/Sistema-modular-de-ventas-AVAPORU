import { useMemo } from "react";
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
  TrendingUp,
  Sparkles,
  Sun,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Calendar,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { useTheme } from "../../../context/ThemeContext";
import { calculateSalesPredictions } from "../../../utils/salesPredictionEngine";

interface SalesPredictionCardProps {
  sales: any[];
  products: any[];
}

export default function SalesPredictionCard({ sales, products }: SalesPredictionCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const chartColors = {
    grid: isDark ? "#334155" : "#e2e8f0",
    axisText: isDark ? "#94a3b8" : "#64748b",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipText: isDark ? "#e2e8f0" : "#1e293b",
    primary: "#4f46e5",
    forecast: "#10b981",
  };

  const prediction = useMemo(() => {
    return calculateSalesPredictions(sales, products, 4);
  }, [sales, products]);

  const isPositiveGrowth = prediction.variacionPorcentualEstimada >= 0;

  return (
    <Card className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-indigo-50/80 via-slate-50/50 to-emerald-50/80 dark:from-indigo-950/30 dark:via-slate-900 dark:to-emerald-950/30 border-b border-slate-100 dark:border-slate-800 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-extrabold text-lg sm:text-xl">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <span>Modelo Predictivo & Tendencia por Temporada</span>
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Temporada: {prediction.temporadaActual.name} → {prediction.temporadaProxima.name}
            </span>
            <button
              onClick={() => window.location.href = '/sales?tab=predictions'}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs cursor-pointer"
            >
              <span>Ver Módulo Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Proyección Próximo Mes */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Proyección Próximo Mes
              </span>
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                  isPositiveGrowth
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                }`}
              >
                {isPositiveGrowth ? (
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
              Regresión lineal ponderada con estacionalidad
            </p>
          </div>

          {/* Factor Estacional Próximo */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Impacto de Temporada
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                x{prediction.temporadaProxima.seasonFactor}
              </span>
            </div>
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {prediction.temporadaProxima.name}
            </p>
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 truncate">
              {prediction.temporadaProxima.description}
            </p>
          </div>

          {/* Recomendación de Negocio */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              <span>Estrategia de Stock</span>
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 leading-snug">
              {prediction.temporadaProxima.recommendedAction}
            </p>
            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Foco:{" "}
              {prediction.temporadaProxima.trendingCategories.join(", ")}
            </p>
          </div>
        </div>

        {/* Gráfico Proyección vs Histórico */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Curva de Ventas Históricas y Pronóstico de Demanda</span>
            </h4>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <span className="w-3 h-3 rounded-full bg-indigo-600"></span>
                Histórico Real
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <span className="w-3 h-1.5 border-b-2 border-dashed border-emerald-500"></span>
                Proyección Predictiva
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={prediction.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHistorico" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorProyeccion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
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
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any, name: any) => [
                    `$${Number(value || 0).toLocaleString("es-AR")}`,
                    name === "historico" ? "Venta Real" : "Proyección Estacional",
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="historico"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fill="url(#colorHistorico)"
                  activeDot={{ r: 6, fill: "#4f46e5" }}
                />
                <Area
                  type="monotone"
                  dataKey="proyeccion"
                  stroke="#10b981"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  fill="url(#colorProyeccion)"
                  activeDot={{ r: 6, fill: "#10b981" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Productos con Mayor Demanda y Alerta de Reposición */}
        {prediction.topProductosTendencia.length > 0 && (
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-500" />
                Artículos en Tendencia para la Temporada Entrante
              </span>
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                Basado en histórico y factores estacionales
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {prediction.topProductosTendencia.map((p) => (
                <div
                  key={p.sku}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">
                        {p.sku}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                        {p.nombre}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {p.categoria} · ${Number(p.precio || 0).toLocaleString("es-AR")}
                      </p>
                    </div>

                    {p.necesitaReposicion ? (
                      <span
                        className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 shrink-0"
                        title="Stock bajo respecto a la demanda esperada"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">
                      Stock:{" "}
                      <strong className="text-slate-800 dark:text-slate-200 font-bold">
                        {p.stockDisponible}
                      </strong>
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                      Demanda est.: ~{p.demandaEstimada} un.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

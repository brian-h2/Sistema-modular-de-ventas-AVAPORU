import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { ShoppingBag, Users } from "lucide-react";
import { useTheme } from "../../../context/ThemeContext";

interface SaleItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  product: {
    nombre: string;
    categoria: string;
  };
}

interface Vendedor {
  _id: string;
  nombre: string;
  email: string;
}

interface Sale {
  _id: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
  items: SaleItem[];
  vendedor?: Vendedor | null;
}

interface SalesChartsProps {
  sales: Sale[];
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
  "#8b5cf6",
];

// Custom label para el pie chart que se muestra solo si hay espacio
const renderCustomLabel = (labelFill: string) => ({
  cx,
  cy,
  midAngle,
  outerRadius,
  name,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (parseFloat(percent) < 3) return null; // No mostrar label si es menos del 3%

  return (
    <text
      x={x}
      y={y}
      fill={labelFill}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {name} ({percent}%)
    </text>
  );
};

export default function SalesCharts({ sales }: SalesChartsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Colores adaptados para ejes/grillas/tooltips de recharts (no soportan clases de Tailwind)
  const chartColors = {
    grid: isDark ? "#334155" : "#e2e8f0",
    axisText: isDark ? "#94a3b8" : "#475569",
    axisTextMuted: isDark ? "#64748b" : "#94a3b8",
    tooltipBg: isDark ? "#1e293b" : "#ffffff",
    tooltipText: isDark ? "#e2e8f0" : "#1e293b",
    legendText: isDark ? "#cbd5e1" : "#475569",
    cellStroke: isDark ? "#0f172a" : "#ffffff",
  };
  // ─── Ventas por Producto (Pie Chart) ───
  const ventasPorProducto: Record<string, number> = {};

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      const nombre = item.nombre || "Sin nombre";
      ventasPorProducto[nombre] =
        (ventasPorProducto[nombre] || 0) + item.cantidad;
    });
  });

  // Ordenar por cantidad y tomar top 7, agrupar el resto como "Otros"
  const sortedProducts = Object.entries(ventasPorProducto).sort(
    ([, a], [, b]) => b - a
  );

  const TOP_N = 7;
  const topProducts = sortedProducts.slice(0, TOP_N);
  const otrosTotal = sortedProducts
    .slice(TOP_N)
    .reduce((acc, [, val]) => acc + val, 0);

  const totalProductos = Object.values(ventasPorProducto).reduce(
    (acc, val) => acc + val,
    0
  );

  const productData = topProducts.map(([name, value]) => ({
    name,
    value,
    percent: ((value / totalProductos) * 100).toFixed(1),
  }));

  if (otrosTotal > 0) {
    productData.push({
      name: "Otros",
      value: otrosTotal,
      percent: ((otrosTotal / totalProductos) * 100).toFixed(1),
    });
  }

  // ─── Ventas por Usuario (Bar Chart) — solo cantidad ───
  const ventasPorUsuario: Record<string, number> = {};

  sales.forEach((sale) => {
    const nombreVendedor = sale.vendedor?.nombre || "Sin asignar";
    ventasPorUsuario[nombreVendedor] =
      (ventasPorUsuario[nombreVendedor] || 0) + 1;
  });

  const userData = Object.entries(ventasPorUsuario)
    .map(([name, ventas]) => ({ name, ventas }))
    .sort((a, b) => b.ventas - a.ventas);

  // Colores individuales para cada barra
  const barColors = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#8b5cf6"];

  return (
    <>
      {/* ─── Gráfico Torta: Ventas por Producto ─── */}
      <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100/50 dark:border-slate-700/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="p-1.5 bg-amber-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-amber-600" />
            </div>
            Ventas por Producto
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {productData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-2">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
              <p>No hay datos de productos aún</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={105}
                    innerRadius={50}
                    dataKey="value"
                    label={renderCustomLabel(chartColors.axisText)}
                    animationBegin={0}
                    animationDuration={800}
                    paddingAngle={2}
                  >
                    {productData.map((_, index) => (
                      <Cell
                        key={`cell-prod-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke={chartColors.cellStroke}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, _name: string, props: any) => {
                      const percent = props?.payload?.percent || 0;
                      return [`${value} uds (${percent}%)`, props?.payload?.name];
                    }}
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      color: chartColors.tooltipText,
                      border: "none",
                      borderRadius: "12px",
                      boxShadow:
                        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                      fontSize: "0.85rem",
                      padding: "10px 16px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span style={{ color: chartColors.legendText, fontSize: "12px", fontWeight: 500 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Gráfico Barras: Ventas por Usuario ─── */}
      <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100/50 dark:border-slate-700/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Ventas por Usuario
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {userData.length === 0 ? (
            <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Users className="w-10 h-10 text-slate-300" />
              <p>No hay datos de ventas aún</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={userData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barSize={40}
                  barGap={8}
                >
                  <defs>
                    {userData.map((_, index) => (
                      <linearGradient
                        key={`grad-${index}`}
                        id={`barGrad-${index}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={barColors[index % barColors.length]}
                          stopOpacity={1}
                        />
                        <stop
                          offset="100%"
                          stopColor={barColors[index % barColors.length]}
                          stopOpacity={0.7}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={chartColors.grid}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartColors.axisText, fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartColors.axisTextMuted, fontSize: 12 }}
                    allowDecimals={false}
                    dx={-5}
                    label={{
                      value: "Cantidad de ventas",
                      angle: -90,
                      position: "insideLeft",
                      offset: 15,
                      style: { fill: chartColors.axisTextMuted, fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.06)", radius: 8 }}
                    contentStyle={{
                      backgroundColor: chartColors.tooltipBg,
                      color: chartColors.tooltipText,
                      borderRadius: "12px",
                      border: "none",
                      boxShadow:
                        "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                      padding: "10px 16px",
                    }}
                    formatter={(value: number) => [
                      `${value} ${value === 1 ? "venta" : "ventas"}`,
                      "Cantidad",
                    ]}
                    labelStyle={{ fontWeight: 600, color: chartColors.tooltipText }}
                  />
                  <Bar
                    dataKey="ventas"
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                    label={{
                      position: "top",
                      fill: chartColors.axisText,
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    {userData.map((_, index) => (
                      <Cell
                        key={`cell-user-${index}`}
                        fill={`url(#barGrad-${index})`}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Target } from "lucide-react";

interface Sale {
  fecha: string;
  total: number;
  categoria: string;
  items: {
    cantidad: number;
    product: {
      categoria: string;
    };
  }[];
}

export default function SalesCategory({ sales }: { sales: Sale[] }) {
  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#6366f1"];

  const ventasPorCategoria: Record<string, number> = {};

  // ▶ Sumar cantidades por categoría
  sales.forEach((sale) => {
    sale.items.forEach((it) => {
      const cat = it.product.categoria;
      const cantidadVendida = it.cantidad;
      ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + cantidadVendida;
    });
  });

  const totalVentas = Object.values(ventasPorCategoria).reduce(
    (acc, val) => acc + val,
    0
  );

  // ▶ Calcular porcentajes reales
  const data = Object.entries(ventasPorCategoria).map(([name, value]) => ({
    name,
    value,
    percent: ((value / totalVentas) * 100).toFixed(1),
  }));

  return (
    <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-[#10b981]" />
          Ventas por Categoría
        </CardTitle>
      </CardHeader>

      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={110}
              dataKey="value"
              label={({ name, percent }) => `${name}: ${percent}%`}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(name, props: any) => {
                const percent = props.payload.percent;
                return [`${percent}%`, name];
              }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "6px",
                fontSize: "0.85rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

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
        }
    }[];
}

export default function SalesCategory({ sales }: { sales: Sale[] }) {

  // 🔹 Paleta de colores (coherente con Tailwind)
  const COLORS = ["#10b981", "#f59e0b", "#ef4444"];

  const ventasPorCategoria: Record<string, number> = {}

  sales.forEach((sale) => {
    sale.items.forEach(it => {
        const cat = it.product.categoria; 
        const cantidadVendida = it.cantidad;
        console.log(cantidadVendida)
        ventasPorCategoria[cat] = (ventasPorCategoria[cat] || 0) + cantidadVendida;
    })
  })

      console.log(ventasPorCategoria)

  const data = Object.entries(ventasPorCategoria).map(([name, value]) => ({
    name,
    value,
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
              label={({ name, value }) => `${name}: ${value}%`}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value}%`, name]}
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
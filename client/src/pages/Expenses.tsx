import { useEffect, useState } from "react";
import {
  DollarSign, Plus, Calendar, FileText, TrendingUp, TrendingDown, Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie
} from "recharts";
import { createReport, listReports } from "../services/expenseService";
import Swal from "sweetalert2";

interface Expense {
  _id: string;
  fecha: string;
  categoria: string;
  description: string;
  monto: number;
  presupuestoDisponible: number;
}



export default function ExpensesModule() {

  //Aca guardamos lo que viene del backend
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [newExpense, setNewExpense] = useState({
    date: "",
    categoria: "",
    description: "",
    monto: "",
    presupuestoDisponible: "",
  });

  // Categorías para mostrar nombre + color (no se guarda en backend)
  const expenseCategories = [
    { id: "alquiler", name: "Alquiler", color: "#ef4444" },
    { id: "servicios", name: "Servicios", color: "#f59e0b" },
    { id: "marketing", name: "Marketing", color: "#10b981" },
    { id: "personal", name: "Personal", color: "#3b82f6" },
    { id: "transporte", name: "Transporte", color: "#8b5cf6" },
    { id: "mantenimiento", name: "Mantenimiento", color: "#06b6d4" },
  ];

  // Obtener nombre de categoría
  const getCategoryName = (id: string) =>
    expenseCategories.find((c) => c.id === id)?.name || id;

  // Agrupar gastos por categoría
  const categoryStats = expenseCategories.map((cat) => {
    const gastosCat = expenses.filter((e) => e.categoria === cat.id);

    const totalGastado = gastosCat.reduce((s, g) => s + g.monto, 0);
    const totalPresupuesto = gastosCat.reduce((s, g) => s + g.presupuestoDisponible, 0);

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      budget: totalPresupuesto,
      spent: totalGastado,
      percent: totalPresupuesto > 0 ? (totalGastado / totalPresupuesto) * 100 : 0,
    };
  });
  

  // Datos para el gráfico de torta
  const pieData = categoryStats.map((c) => ({
    name: c.name,
    value: c.percent,
    fill: c.color,
  }));

  // ⏳ Cargar gastos desde backend
  useEffect(() => {
    listReports()
      .then((data) => setExpenses(data))
      .catch(() =>
        Swal.fire("Error", "No se pudo cargar los gastos desde el servidor", "error")
      );
  }, []);

  // 📊 Calcular resumen en base a datos REALES
  const totalSpent = expenses.reduce((s, e) => s + e.monto, 0);
  const totalBudget = expenses.reduce((s, e) => s + e.presupuestoDisponible, 0);
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Datos para el gráfico
  const chartData = expenses.map((e) => ({
    name: getCategoryName(e.categoria),
    spent: e.monto,
    budget: e.presupuestoDisponible,
  }));

  // ✅ Crear gasto
  const createExpense = () => {
    const reportData = {
      date: new Date(newExpense.date),
      categoria: newExpense.categoria,
      description: newExpense.description,
      monto: parseFloat(newExpense.monto),
      presupuestoDisponible: parseFloat(newExpense.presupuestoDisponible),
    };

    createReport(reportData)
      .then(() => {
        Swal.fire("Éxito", "Gasto registrado correctamente", "success");
        listReports().then(setExpenses);
      })
      .catch(() =>
        Swal.fire("Error", "No se pudo registrar el gasto", "error")
      );

    setIsDialogOpen(false);
    setNewExpense({ date: "", categoria: "", description: "", monto: "", presupuestoDisponible: "" });
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gastos y Finanzas</h1>
          <p className="text-gray-600 mt-1">Control financiero basado en datos reales</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
        </button>
      </div>

      {/* MODAL */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl"> 
            <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Gasto</h2>
            <p className="text-gray-600 mb-6">Complete los campos para registrar un nuevo gasto.</p>

            <div className="space-y-4">

              {/* Fecha - Monto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                    className="w-full border p-2 rounded bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Monto *</label>
                  <input
                    type="number"
                    value={newExpense.monto}
                    onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                    className="w-full border p-2 rounded bg-gray-50"
                  />
                </div>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium mb-1">Categoría *</label>
                <select
                  value={newExpense.categoria}
                  onChange={(e) => setNewExpense({ ...newExpense, categoria: e.target.value })}
                  className="w-full border p-2 rounded bg-gray-50"
                >
                  <option value="">Seleccionar categoría</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium mb-1">Descripción *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full border p-2 rounded bg-gray-50"
                />
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-sm font-medium mb-1">Presupuesto Disponible *</label>
                <input
                  type="number"
                  value={newExpense.presupuestoDisponible}
                  onChange={(e) => setNewExpense({ ...newExpense, presupuestoDisponible: e.target.value })}
                  className="w-full border p-2 rounded bg-gray-50"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsDialogOpen(false)} className="flex-1 border p-2 rounded">
                  Cancelar
                </button>
                <button onClick={createExpense} className="flex-1 bg-green-500 text-white p-2 rounded">
                  Guardar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow rounded-xl"><CardContent className="p-6 flex items-center gap-2">
          <DollarSign className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Gastos Totales</p>
          </div>
        </CardContent></Card>

        <Card className="bg-white shadow rounded-xl"><CardContent className="p-6 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Presupuestos Declarados</p>
          </div>
        </CardContent></Card>

        <Card className="bg-white shadow rounded-xl"><CardContent className="p-6 flex items-center gap-2">
          {budgetUsage > 90 ? <TrendingUp className="w-8 h-8 text-red-500" /> : <TrendingDown className="w-8 h-8 text-green-500" />}
          <div>
            <p className="text-2xl font-bold">{budgetUsage.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Uso del Presupuesto</p>
          </div>
        </CardContent></Card>

        <Card className="bg-white shadow rounded-xl"><CardContent className="p-6 flex items-center gap-2">
          <Calendar className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-2xl font-bold">{expenses.length}</p>
            <p className="text-sm text-gray-600">Gastos Registrados</p>
          </div>
        </CardContent></Card>
      </div>

      {/* GRAFICO */}
{/* GRID PRINCIPAL */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

  {/* PRESUPUESTO vs GASTOS */}
  <div className="lg:col-span-2">
    <Card className="bg-white shadow rounded-xl p-6 mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" /> Presupuesto vs Gastos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="budget" fill="#e5e7eb" />
              <Bar dataKey="spent" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>

    {/* DISTRIBUCIÓN POR CATEGORÍA */}
    <Card className="bg-white shadow rounded-xl p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-green-500" /> Distribución por Categoría
        </CardTitle>
      </CardHeader>

      <CardContent className="flex justify-center">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              labelLine={false}
              label={(entry: any) => `${entry.name}: ${(entry.value as number).toLocaleString()}%`}
            />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  </div>

  {/* ESTADO POR CATEGORÍA */}
  <div>
    <Card className="bg-white shadow rounded-xl p-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" /> Estado por Categoría
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryStats.map((cat) => (
          <div key={cat.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium flex items-center gap-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                ></span>
                {cat.name}
              </span>
              <span className="font-semibold">{cat.percent.toFixed(1)}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${Math.min(cat.percent, 100)}%`,
                  backgroundColor: cat.color,
                }}
              ></div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    {/* GASTOS REGISTRADOS */}
    <Card className="bg-white shadow rounded-xl p-6 mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-green-500" /> Gastos Registrados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        {expenses.map((exp) => (
          <div key={exp._id} className="border border-gray-300 rounded-lg p-3">
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-sm">{exp.description}</p>
                <p className="text-xs text-gray-600">{getCategoryName(exp.categoria)}</p>
                <p className="text-xs text-gray-500">
                  {new Date(exp.fecha).toLocaleDateString("es-ES")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">
                  ${exp.monto.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Presupuesto: ${exp.presupuestoDisponible.toLocaleString()}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
</div>
    </div>
  );
}

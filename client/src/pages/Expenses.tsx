import React, { useState } from "react";
import {
  DollarSign,
  Plus,
  Calendar,
  FileText,
  TrendingUp,
  TrendingDown,
  Home,
  Zap,
  Car,
  Users,
  ShoppingBag,
  Wrench,
  CreditCard,
  Receipt,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// --- Datos mockeados ---
const expenseCategories = [
  { id: "alquiler", name: "Alquiler", icon: <Home className="w-5 h-5" />, color: "#ef4444", budget: 180000, spent: 180000 },
  { id: "servicios", name: "Servicios", icon: <Zap className="w-5 h-5" />, color: "#f59e0b", budget: 25000, spent: 22300 },
  { id: "marketing", name: "Marketing", icon: <ShoppingBag className="w-5 h-5" />, color: "#10b981", budget: 50000, spent: 35000 },
  { id: "personal", name: "Personal", icon: <Users className="w-5 h-5" />, color: "#3b82f6", budget: 200000, spent: 185000 },
  { id: "transporte", name: "Transporte", icon: <Car className="w-5 h-5" />, color: "#8b5cf6", budget: 15000, spent: 12500 },
  { id: "mantenimiento", name: "Mantenimiento", icon: <Wrench className="w-5 h-5" />, color: "#06b6d4", budget: 20000, spent: 8500 },
];

const expenses = [
  { id: "1", date: "2024-09-08", category: "alquiler", description: "Alquiler mensual del local", amount: 180000, paymentMethod: "transferencia", notes: "Mes de septiembre 2024" },
  { id: "2", date: "2024-09-07", category: "servicios", description: "Factura de luz - Agosto", amount: 12300, paymentMethod: "debito", notes: "Consumo alto por aire acondicionado" },
  { id: "3", date: "2024-09-06", category: "marketing", description: "Campaña Instagram Ads", amount: 15000, paymentMethod: "tarjeta", notes: "Campaña zapatillas nuevas" },
  { id: "4", date: "2024-09-05", category: "personal", description: "Sueldo empleado", amount: 95000, paymentMethod: "transferencia", notes: "Sueldo + presentismo" },
];


export default function ExpensesModule() {


  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, ] = useState("all");
  const [newExpense, setNewExpense] = useState({
    category: "",
    description: "",
    amount: "",
    paymentMethod: "",
    notes: "",
  });

  const totalBudget = expenseCategories.reduce((s, c) => s + c.budget, 0);
  const totalSpent = expenseCategories.reduce((s, c) => s + c.spent, 0);
  const budgetUsage = (totalSpent / totalBudget) * 100;

  const filteredExpenses = expenses.filter(
    (e) => selectedCategory === "all" || e.category === selectedCategory
  );

  const createExpense = () => {
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      alert("Complete los campos obligatorios");
      return;
    }
    alert("Gasto registrado ✅");
    setIsDialogOpen(false);
    setNewExpense({ category: "", description: "", amount: "", paymentMethod: "", notes: "" });
  };

const getCategoryName = (id: string): string =>
    expenseCategories.find((cat) => cat.id === id)?.name || id;

const getPaymentMethodIcon = (method: string): React.ReactNode => {
    switch (method) {
        case "efectivo":
            return <DollarSign className="w-4 h-4" />;
        case "tarjeta":
        case "debito":
            return <CreditCard className="w-4 h-4" />;
        case "transferencia":
            return <FileText className="w-4 h-4" />;
        default:
            return <Receipt className="w-4 h-4" />;
    }
};

  const chartData = expenseCategories.map((cat) => ({
    name: cat.name,
    spent: cat.spent,
    budget: cat.budget,
  }));

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gastos y Finanzas</h1>
          <p className="text-gray-600 mt-1">Control de gastos operativos y análisis financiero</p>
        </div>
        <button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
        </button>
      </div>

      {/* MODAL SIMPLE */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Registrar Nuevo Gasto</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1 font-medium">Categoría *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Seleccionar categoría</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Descripción *</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Monto *</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Método de Pago</label>
                <select
                  value={newExpense.paymentMethod}
                  onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                  className="border rounded p-2 w-full"
                >
                  <option value="">Seleccionar método</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="debito">Débito</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium">Notas</label>
                <textarea
                  value={newExpense.notes}
                  onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                  className="border rounded p-2 w-full"
                />
              </div>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 border rounded p-2 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={createExpense}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl">
          <CardContent className="[&:last-child]:pb-6 bg-white shadow-md rounded-lg p-6 flex items-center gap-2 overflow-y-auto max-h-[75vh]">
            <DollarSign className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Gastos del Mes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl">
          <CardContent className="[&:last-child]:pb-6 bg-white shadow-md rounded-lg p-6 flex items-center gap-2 overflow-y-auto max-h-[75vh]">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Presupuesto Total</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl">
          <CardContent className="[&:last-child]:pb-6 bg-white shadow-md rounded-lg p-6 flex items-center gap-2 overflow-y-auto max-h-[75vh]">
            {budgetUsage > 90 ? (
              <TrendingUp className="w-8 h-8 text-red-500" />
            ) : (
              <TrendingDown className="w-8 h-8 text-green-500" />
            )}
            <div>
              <p className="text-2xl font-bold">{budgetUsage.toFixed(1)}%</p>
              <p className="text-sm text-gray-600">Uso del Presupuesto</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl">
          <CardContent className="[&:last-child]:pb-6 bg-white shadow-md rounded-lg p-6 flex items-center gap-2 overflow-y-auto max-h-[75vh]">
            <Calendar className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{filteredExpenses.length}</p>
              <p className="text-sm text-gray-600">Gastos Registrados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRAFICO */}
      <Card className="bg-white shadow rounded-lg p-6 mb-8">
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

      {/* LISTA DE GASTOS */}
      <Card className="bg-white shadow rounded-lg p-6 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-500" /> Gastos Recientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {expenses.map((exp) => (
            <div key={exp.id} className="border border-gray-300 rounded-lg p-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium text-sm">{exp.description}</p>
                  <p className="text-xs text-gray-600">{getCategoryName(exp.category)}</p>
                  <p className="text-xs text-gray-500">{new Date(exp.date).toLocaleDateString("es-ES")}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">${exp.amount.toLocaleString()}</p>
                  <div className="flex items-center gap-1 justify-end text-xs text-gray-500 capitalize">
                    {getPaymentMethodIcon(exp.paymentMethod)} {exp.paymentMethod}
                  </div>
                </div>
              </div>
              {exp.notes && <p className="text-xs text-gray-500 mt-2 italic">{exp.notes}</p>}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

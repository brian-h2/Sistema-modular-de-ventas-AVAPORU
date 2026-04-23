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
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

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
    if (!newExpense.date || !newExpense.categoria || !newExpense.description || !newExpense.monto || !newExpense.presupuestoDisponible) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos requeridos (*).'
      });
      return;
    }

    if (parseFloat(newExpense.monto) <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'El monto del gasto debe ser mayor a 0.'
      });
      return;
    }

    if (parseFloat(newExpense.presupuestoDisponible) < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Presupuesto inválido',
        text: 'El presupuesto disponible no puede ser negativo.'
      });
      return;
    }

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
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-red-100 text-red-600 rounded-xl shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gastos y Finanzas</h1>
          </div>
          <p className="text-lg text-slate-500 font-medium mt-2">Control financiero basado en datos reales</p>
        </div>
        <motion.button
          onClick={() => setIsDialogOpen(true)}
          className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4 mr-2" /> Registrar Gasto
        </motion.button>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isDialogOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
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
                      className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Monto *</label>
                    <input
                      type="number"
                      value={newExpense.monto}
                      onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                      className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría *</label>
                  <select
                    value={newExpense.categoria}
                    onChange={(e) => setNewExpense({ ...newExpense, categoria: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
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
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  />
                </div>

                {/* Presupuesto */}
                <div>
                  <label className="block text-sm font-medium mb-1">Presupuesto Disponible *</label>
                  <input
                    type="number"
                    value={newExpense.presupuestoDisponible}
                    onChange={(e) => setNewExpense({ ...newExpense, presupuestoDisponible: e.target.value })}
                    className="w-full border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border border-slate-300 p-2.5 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    onClick={createExpense}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-colors font-medium shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Guardar
                  </motion.button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Gastos Totales</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-7 h-7 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
                <p className="text-sm text-slate-500">Presupuestos Declarados</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className={'p-2 rounded-lg ' + (budgetUsage > 90 ? 'bg-red-100' : 'bg-emerald-100')}>
                {budgetUsage > 90 ? <TrendingUp className="w-7 h-7 text-red-500" /> : <TrendingDown className="w-7 h-7 text-emerald-500" />}
              </div>
              <div>
                <p className="text-2xl font-bold">{budgetUsage.toFixed(1)}%</p>
                <p className="text-sm text-slate-500">Uso del Presupuesto</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm rounded-xl border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{expenses.length}</p>
                <p className="text-sm text-slate-500">Gastos Registrados</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* GRID PRINCIPAL */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >

        {/* PRESUPUESTO vs GASTOS */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mb-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                Presupuesto vs Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* DISTRIBUCIÓN POR CATEGORÍA */}
          <Card className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                Distribución por Categoría
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
                    label={(entry: any) => entry.name + ': ' + Number(entry.value).toLocaleString() + '%'}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* ESTADO POR CATEGORÍA */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                Estado por Categoría
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryStats.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium flex items-center gap-1.5">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      {cat.name}
                    </span>
                    <span className="font-semibold">{cat.percent.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: Math.min(cat.percent, 100) + '%' }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* GASTOS REGISTRADOS */}
          <Card className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 mt-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Receipt className="w-5 h-5 text-amber-600" />
                </div>
                Gastos Registrados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {expenses.map((exp, i) => (
                <motion.div
                  key={exp._id}
                  className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-all bg-slate-50/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
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
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

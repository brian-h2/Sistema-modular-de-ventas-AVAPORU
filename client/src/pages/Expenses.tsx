import { useEffect, useState } from "react";
import {
  DollarSign, Plus, Calendar, FileText, TrendingUp, TrendingDown, Receipt
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { createReport, listReports } from "../services/expenseService";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";

interface Expense {
  _id: string;
  fecha: string;
  categoria: string;
  descripcion?: string;
  description?: string;
  monto: number;
  presupuestoDisponible: number;
}



export default function ExpensesModule() {

  //Aca guardamos lo que viene del backend
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODAS");

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

  // ⏳ Cargar gastos desde backend
  useEffect(() => {
    listReports()
      .then((data) => setExpenses(Array.isArray(data) ? data : []))
      .catch(() =>
        Swal.fire("Error", "No se pudo cargar los gastos desde el servidor", "error")
      );
  }, []);

  // 📊 Calcular totales en base a datos REALES
  const totalSpent = expenses.reduce((s, e) => s + Number(e.monto || 0), 0);
  const totalBudget = expenses.reduce((s, e) => s + Number(e.presupuestoDisponible || 0), 0);
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Agrupar gastos por categoría
  const categoryStats = expenseCategories.map((cat) => {
    const gastosCat = expenses.filter(
      (e) => (e.categoria || "").toLowerCase() === cat.id.toLowerCase()
    );

    const totalGastado = gastosCat.reduce((s, g) => s + Number(g.monto || 0), 0);
    const totalPresupuesto = gastosCat.reduce((s, g) => s + Number(g.presupuestoDisponible || 0), 0);
    const executionPercent = totalPresupuesto > 0 ? (totalGastado / totalPresupuesto) * 100 : 0;
    const sharePercent = totalSpent > 0 ? (totalGastado / totalSpent) * 100 : 0;

    return {
      id: cat.id,
      name: cat.name,
      color: cat.color,
      budget: totalPresupuesto,
      spent: totalGastado,
      percent: executionPercent,
      sharePercent: Number(sharePercent.toFixed(1)),
    };
  });

  // Datos para el gráfico de torta (% de participación del gasto total)
  const pieData = categoryStats
    .filter((c) => c.spent > 0)
    .map((c) => ({
      name: c.name,
      value: c.spent,
      percentage: c.sharePercent,
      fill: c.color,
    }));

  // Datos para el gráfico de barras comparativo (Presupuesto vs Gastado por categoría)
  const chartData = categoryStats.map((c) => ({
    name: c.name,
    spent: c.spent,
    budget: c.budget,
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
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 min-h-screen flex flex-col gap-8 font-sans">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl shadow-sm">
              <Receipt className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Gastos y Finanzas</h1>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Control financiero basado en datos reales</p>
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
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">Registrar Nuevo Gasto</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">Complete los campos para registrar un nuevo gasto.</p>

              <div className="space-y-4">

                {/* Fecha - Monto */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Fecha *</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Monto *</label>
                    <input
                      type="number"
                      value={newExpense.monto}
                      onChange={(e) => setNewExpense({ ...newExpense, monto: e.target.value })}
                      className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Categoría *</label>
                  <select
                    value={newExpense.categoria}
                    onChange={(e) => setNewExpense({ ...newExpense, categoria: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  >
                    <option value="">Seleccionar categoría</option>
                    {expenseCategories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Descripción *</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  />
                </div>

                {/* Presupuesto */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-slate-300">Presupuesto Disponible *</label>
                  <input
                    type="number"
                    value={newExpense.presupuestoDisponible}
                    onChange={(e) => setNewExpense({ ...newExpense, presupuestoDisponible: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  />
                </div>

                {/* Botones */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1 border border-slate-300 dark:border-slate-600 p-2.5 rounded-xl hover:bg-slate-50 hover:dark:bg-slate-950 transition-colors font-medium"
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
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-lg">
                <DollarSign className="w-7 h-7 text-red-500 dark:text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalSpent.toLocaleString()}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gastos Totales</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <FileText className="w-7 h-7 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">${totalBudget.toLocaleString()}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Presupuestos Declarados</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className={'p-2 rounded-lg ' + (budgetUsage > 90 ? 'bg-red-100 dark:bg-red-900/40' : 'bg-emerald-100 dark:bg-emerald-900/40')}>
                {budgetUsage > 90 ? <TrendingUp className="w-7 h-7 text-red-500 dark:text-red-400" /> : <TrendingDown className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />}
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{budgetUsage.toFixed(1)}%</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Uso del Presupuesto</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 transition-all hover:-translate-y-1 hover:shadow-md">
            <CardContent className="p-6 flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <Calendar className="w-7 h-7 text-purple-500 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{expenses.length}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Gastos Registrados</p>
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
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700 p-6 mb-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
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
                    <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => [
                        `$${Number(value || 0).toLocaleString('es-AR')}`,
                        name === 'budget' || name === 'Presupuesto' ? 'Presupuesto' : 'Gastado'
                      ]}
                    />
                    <Bar dataKey="budget" name="Presupuesto" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="spent" name="Gastado" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* DISTRIBUCIÓN POR CATEGORÍA */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700 p-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                Distribución por Categoría (% del Gasto Total)
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col items-center">
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={45}
                      dataKey="value"
                      paddingAngle={2}
                      labelLine={false}
                      label={({ name, percentage }: any) => `${name}: ${percentage}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value: any, name: any, item: any) => [
                        `$${Number(value || 0).toLocaleString("es-AR")} (${item?.payload?.percentage || 0}%)`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Leyenda interactiva de categorías */}
              <div className="flex flex-wrap justify-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 w-full">
                {pieData.map((p) => (
                  <span
                    key={p.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.fill }} />
                    <span>{p.name}:</span>
                    <strong className="text-slate-900 dark:text-slate-100">{p.percentage}%</strong>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ESTADO POR CATEGORÍA Y GASTOS REGISTRADOS */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          {/* ESTADO POR CATEGORÍA */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700 p-6 transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                Ejecución Presupuestaria por Rubro
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
                    <span className="font-medium flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      {cat.name}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${cat.spent.toLocaleString("es-AR")} / ${cat.budget.toLocaleString("es-AR")} ({cat.percent.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      className="h-2.5 rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: Math.min(cat.percent, 100) + "%" }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* GASTOS REGISTRADOS */}
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700 p-6 transition-all hover:shadow-md">
            <CardHeader className="flex flex-col gap-3 pb-3">
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                  <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <span>Gastos Registrados</span>
                <span className="ml-auto text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {expenses.length} movimientos
                </span>
              </CardTitle>

              {/* Filtros */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Buscar por descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                >
                  <option value="TODAS">Todas las categorías</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
              {expenses
                .filter((exp) => {
                  const desc = (exp.descripcion || exp.description || "").toLowerCase();
                  const matchesSearch = desc.includes(searchTerm.toLowerCase());
                  const matchesCat =
                    categoryFilter === "TODAS" ||
                    (exp.categoria || "").toLowerCase() === categoryFilter.toLowerCase();
                  return matchesSearch && matchesCat;
                })
                .map((exp, i) => {
                  const catInfo = expenseCategories.find(
                    (c) => c.id.toLowerCase() === (exp.categoria || "").toLowerCase()
                  );
                  const desc = exp.descripcion || exp.description || "Gasto registrado";
                  const fecha = exp.fecha ? new Date(exp.fecha).toLocaleDateString("es-AR") : "-";

                  return (
                    <motion.div
                      key={exp._id || i}
                      className="border border-slate-200/80 dark:border-slate-700/80 rounded-xl p-3.5 hover:shadow-xs transition-all bg-white dark:bg-slate-800/60 flex flex-col gap-2"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      {/* Fila Superior: Categoría + Fecha y Monto */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${catInfo?.color || "#64748b"}15`,
                              color: catInfo?.color || "#64748b",
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: catInfo?.color || "#64748b" }}
                            />
                            {catInfo?.name || exp.categoria}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                            {fecha}
                          </span>
                        </div>

                        <span className="font-extrabold text-sm text-red-600 dark:text-red-400 tracking-tight">
                          ${Number(exp.monto || 0).toLocaleString("es-AR")}
                        </span>
                      </div>

                      {/* Fila Media: Descripción Completa */}
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                        {desc}
                      </p>

                      {/* Fila Inferior: Presupuesto y Cobertura */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>
                          Presupuesto asignado:{" "}
                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                            ${Number(exp.presupuestoDisponible || 0).toLocaleString("es-AR")}
                          </strong>
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {exp.presupuestoDisponible > 0
                            ? Math.round((exp.monto / exp.presupuestoDisponible) * 100)
                            : 0}%
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

import React from "react";

interface Expense {
  _id: string;
  description: string;
  monto: number;
  fecha: string;
  categoria: string;
  presupuestoDisponible: number;
}

interface Props {
  expenses: Expense[];
}

export const ExpensesSummaryCard: React.FC<Props> = ({ expenses }) => {
  // Filtrar solo gastos del día actual
  const today = new Date().toISOString().split("T")[0];

  const todaysExpenses = expenses.filter((exp) =>
    exp.fecha.startsWith(today)
  );

  // Total gastado hoy
  const totalToday = todaysExpenses.reduce((acc, exp) => acc + exp.monto, 0);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
      <h1 className="text-lg font-semibold text-gray-700 mb-6">
        Gastos del día 📉
      </h1>

      <p className="text-2xl font-bold text-red-600">
        ${totalToday.toLocaleString()}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        Gastos registrados hoy
      </p>
    </div>
  );
};

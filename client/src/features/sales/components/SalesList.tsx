import { useEffect, useState } from "react";
import { CheckCircleIcon, CurrencyDollarIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import type { Sale } from "../types";
import Pagination from "../../../components/ui/Pagination";

interface SalesListProps {
  sales: Sale[];
  onUpdateStatus: (id: string, status: Sale["estado"]) => void;
}

export default function SalesList({ sales, onUpdateStatus }: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const getStatusBadge = (estado: Sale["estado"]) => {
    const styles: Record<string, string> = {
      CREADA: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      PAGADA: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      FACTURADA: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      CANCELADA: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return styles[estado] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300";
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || sale.estado === statusFilter;

    const saleDate = new Date(sale.fecha).toISOString().slice(0, 10);
    const matchesFrom = !dateFrom || saleDate >= dateFrom;
    const matchesTo = !dateTo || saleDate <= dateTo;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFrom, dateTo, pageSize]);

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto max-h-[75vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-slate-100">Órdenes de Venta</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-slate-900"
          >
            <option value="TODOS">Todos los estados</option>
            <option value="CREADA">Creada</option>
            <option value="PAGADA">Pagada</option>
            <option value="FACTURADA">Facturada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white dark:bg-slate-900"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            type="button"
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Limpiar fechas
          </button>
        )}
      </div>

      {filteredSales.length === 0 && <p className="text-gray-500 dark:text-slate-400">No hay ventas que coincidan con la búsqueda.</p>}
      <AnimatePresence>
        {paginatedSales.map((sale) => (
          <motion.div
            key={sale._id}
            className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-800/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            layout
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">🔖 {sale.cliente}</p>
                <p className="text-sm text-gray-400 dark:text-slate-500">{'Fecha: ' + sale.fecha}</p>
              </div>
              <div className="text-right">
                <div className="flex space-x-2 mt-3 justify-end">
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "PAGADA")}
                    className="text-green-600 dark:text-green-400 hover:text-green-800 hover:dark:text-green-400 cursor-pointer p-1.5 rounded-lg hover:bg-green-50 hover:dark:bg-green-900/30 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "FACTURADA")}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-800 hover:dark:text-purple-400 cursor-pointer p-1.5 rounded-lg hover:bg-purple-50 hover:dark:bg-purple-900/30 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "CANCELADA")}
                    className="text-red-600 dark:text-red-400 hover:text-red-800 hover:dark:text-red-400 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 hover:dark:bg-red-900/30 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </motion.button>
                </div>
                <span className={'inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full border ' + getStatusBadge(sale.estado)}>
                  {sale.estado}
                </span>
                <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-2">
                  ${sale.total.toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {sale.items.map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 py-1.5 text-sm">
                  <span>{item.nombre}</span>
                  <span>{item.cantidad + ' x $' + item.precioUnitario.toLocaleString("es-AR") + ' = $' + (item.cantidad * item.precioUnitario).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>

            {sale.notas && (
              <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                <span className="font-semibold">Notas:</span> {sale.notas}
              </div>
            )}
            
            {sale.vendedor && (
               <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                <span className="font-semibold">Vendedor:</span> {sale.vendedor.nombre}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {filteredSales.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}

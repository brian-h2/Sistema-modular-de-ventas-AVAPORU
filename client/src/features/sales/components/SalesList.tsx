import { useEffect, useState } from "react";
import { CheckCircleIcon, CurrencyDollarIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Calendar, X } from "lucide-react";
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
  const [pageSize, setPageSize] = useState(5);

  const getStatusBadge = (estado: Sale["estado"]) => {
    const styles: Record<string, string> = {
      CREADA: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
      PAGADA: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      FACTURADA: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      CANCELADA: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };
    return styles[estado] || "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300";
  };

  const formatDateDDMMYYYY = (dateInput: string | Date): string => {
    if (!dateInput) return "";
    const dateStr = typeof dateInput === "string" ? dateInput : dateInput.toISOString();
    
    // Si viene en formato YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] = dateStr.slice(0, 10).split("-");
      return `${day}/${month}/${year}`;
    }

    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
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
      {/* Encabezado y Toolbar de Filtros */}
      <div className="flex flex-col gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
        {/* Título y contador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Órdenes de Venta
            </h2>
            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
              {filteredSales.length} {filteredSales.length === 1 ? "orden" : "órdenes"}
            </span>
          </div>
        </div>

        {/* Barra de Filtros Unificada */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
          
          {/* Búsqueda por cliente */}
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-xs transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Rango de Fechas (Date Pickers modernos en formato DD/MM/YYYY) */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 pr-1.5 border-r border-slate-200 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span>Fechas (DD/MM/YYYY)</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desde</span>
                <input
                  type="date"
                  lang="es-AR"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-2 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900"
                  aria-label="Fecha desde en formato DD/MM/YYYY"
                />
              </div>

              <span className="text-slate-300 dark:text-slate-600 text-xs font-bold">–</span>

              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hasta</span>
                <input
                  type="date"
                  lang="es-AR"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-2 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900"
                  aria-label="Fecha hasta en formato DD/MM/YYYY"
                />
              </div>

              {(dateFrom || dateTo) && (
                <button
                  type="button"
                  onClick={() => { setDateFrom(""); setDateTo(""); }}
                  className="p-1 ml-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Limpiar rango de fechas"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filtro de Estado */}
          <div className="relative min-w-[140px]">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="CREADA">Creada</option>
              <option value="PAGADA">Pagada</option>
              <option value="FACTURADA">Facturada</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

        </div>
      </div>

      {filteredSales.length === 0 && <p className="text-gray-500 dark:text-slate-400">No hay ventas que coincidan con la búsqueda.</p>}
      {paginatedSales.map((sale) => (
        <div
          key={sale._id}
          className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-800/30"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">🔖 {sale.cliente}</p>
              <p className="text-sm text-gray-400 dark:text-slate-500">{'Fecha: ' + formatDateDDMMYYYY(sale.fecha)}</p>
            </div>
            <div className="text-right">
              <div className="flex space-x-2 mt-3 justify-end">
                <button
                  onClick={() => onUpdateStatus(sale._id, "PAGADA")}
                  className="text-green-600 dark:text-green-400 hover:text-green-800 hover:dark:text-green-400 cursor-pointer p-1.5 rounded-lg hover:bg-green-50 hover:dark:bg-green-900/30 transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onUpdateStatus(sale._id, "FACTURADA")}
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-800 hover:dark:text-purple-400 cursor-pointer p-1.5 rounded-lg hover:bg-purple-50 hover:dark:bg-purple-900/30 transition-colors"
                >
                  <CurrencyDollarIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onUpdateStatus(sale._id, "CANCELADA")}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 hover:dark:text-red-400 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 hover:dark:bg-red-900/30 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
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
        </div>
      ))}

      {filteredSales.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredSales.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </div>
  );
}

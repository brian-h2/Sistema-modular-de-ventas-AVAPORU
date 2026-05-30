import { CheckCircleIcon, CurrencyDollarIcon, TrashIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import type { Sale } from "../types";

interface SalesListProps {
  sales: Sale[];
  onUpdateStatus: (id: string, status: Sale["estado"]) => void;
}

export default function SalesList({ sales, onUpdateStatus }: SalesListProps) {
  const getStatusBadge = (estado: Sale["estado"]) => {
    const styles: Record<string, string> = {
      CREADA: "bg-yellow-100 text-yellow-700 border-yellow-200",
      PAGADA: "bg-green-100 text-green-700 border-green-200",
      FACTURADA: "bg-purple-100 text-purple-700 border-purple-200",
      CANCELADA: "bg-red-100 text-red-700 border-red-200",
    };
    return styles[estado] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-y-auto max-h-[75vh]">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Órdenes de Venta</h2>
      {sales.length === 0 && <p className="text-gray-500">No hay ventas registradas aún.</p>}
      <AnimatePresence>
        {sales.map((sale) => (
          <motion.div
            key={sale._id}
            className="border border-slate-200 rounded-xl p-4 mb-4 hover:shadow-md transition-all bg-slate-50/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            layout
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold">🔖 {sale.cliente}</p>
                <p className="text-sm text-gray-400">{'Fecha: ' + sale.fecha}</p>
              </div>
              <div className="text-right">
                <div className="flex space-x-2 mt-3 justify-end">
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "PAGADA")}
                    className="text-green-600 hover:text-green-800 cursor-pointer p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "FACTURADA")}
                    className="text-purple-600 hover:text-purple-800 cursor-pointer p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CurrencyDollarIcon className="h-5 w-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => onUpdateStatus(sale._id, "CANCELADA")}
                    className="text-red-600 hover:text-red-800 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </motion.button>
                </div>
                <span className={'inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full border ' + getStatusBadge(sale.estado)}>
                  {sale.estado}
                </span>
                <p className="text-xl font-semibold text-green-600 mt-2">
                  ${sale.total.toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            <div className="mt-4">
              {sale.items.map((item, i) => (
                <div key={i} className="flex justify-between text-gray-600 border-b border-slate-200 py-1.5 text-sm">
                  <span>{item.nombre}</span>
                  <span>{item.cantidad + ' x $' + item.precioUnitario.toLocaleString("es-AR") + ' = $' + (item.cantidad * item.precioUnitario).toLocaleString("es-AR")}</span>
                </div>
              ))}
            </div>

            {sale.notas && (
              <div className="mt-2 text-sm text-gray-500">
                <span className="font-semibold">Notas:</span> {sale.notas}
              </div>
            )}
            
            {sale.vendedor && (
               <div className="mt-2 text-sm text-gray-500">
                <span className="font-semibold">Vendedor:</span> {sale.vendedor.nombre}
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

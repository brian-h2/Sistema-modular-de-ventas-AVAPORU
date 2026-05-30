import { useState } from "react";
import { PlusCircleIcon, TrashIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

interface SalesFormProps {
  products: any[];
  onSubmit: (saleData: any) => Promise<boolean>;
}

export default function SalesForm({ products, onSubmit }: SalesFormProps) {
  const [form, setForm] = useState({
    cliente: "",
    items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }],
  });

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { nombre: "", cantidad: 1, precioUnitario: 0 }] });
  };

  const handleRemoveItem = (index: number) => {
    const copy = [...form.items];
    copy.splice(index, 1);
    setForm({ ...form, items: copy });
  };

  const handleChangeItem = (index: number, field: string, value: string | number) => {
    const copy = [...form.items];
    copy[index] = { ...copy[index], [field]: value };
    setForm({ ...form, items: copy });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.cliente.trim()) {
      Swal.fire({ icon: 'warning', title: 'Cliente faltante', text: 'Por favor ingresa el nombre del cliente.' });
      return;
    }

    if (form.items.some(item => !item.nombre.trim() || item.cantidad <= 0 || item.precioUnitario < 0)) {
      Swal.fire({ icon: 'warning', title: 'Items inválidos', text: 'Verifica que todos los items tengan código, cantidad mayor a 0 y precio válido.' });
      return;
    }

    const total = form.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

    const saleData = {
      productos: form.items.map(item => ({
        productId: item.nombre,
        quantity: item.cantidad,
        precioUnitario: item.precioUnitario
      })),
      total,
      fecha: new Date().toISOString(),
      cliente: form.cliente,
    };

    const success = await onSubmit(saleData);
    if (success) {
      setForm({ cliente: "", items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }] });
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <PlusCircleIcon className="h-6 w-6 text-indigo-500" />
        <span>Registrar Nueva Venta</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block font-medium text-gray-700 mb-1">Cliente</label>
          <input
            type="text"
            required
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50/50 transition-colors"
            placeholder="Nombre del cliente"
          />
        </div>

        <div>
          <h3 className="font-medium text-gray-700 mb-2">Productos / Items</h3>
          <p className="font-light text-gray-500 mb-4 text-sm">Selecciona un producto del listado para agregar a la venta.</p>
          <AnimatePresence>
            {form.items.map((item, index) => (
              <motion.div
                key={index}
                className="flex flex-col gap-2 mb-4 p-4 border border-slate-100 bg-slate-50/50 rounded-xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                    <select
                      value={item.nombre}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matchedProd = products.find(p => p.sku === val);

                        const copy = [...form.items];
                        copy[index] = {
                          ...copy[index],
                          nombre: val,
                          ...(matchedProd ? { precioUnitario: matchedProd.precio } : {})
                        };
                        setForm({ ...form, items: copy });
                      }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors appearance-none cursor-pointer"
                      required
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(p => (
                        <option key={p._id} value={p.sku}>
                          {p.nombre} (${p.precio.toLocaleString("es-AR")})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                    <input
                      type="number"
                      placeholder="Cant."
                      value={item.cantidad}
                      onChange={(e) => handleChangeItem(index, "cantidad", parseInt(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      min={1}
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Precio Unit. ($)</label>
                    <input
                      type="number"
                      placeholder="Precio"
                      value={item.precioUnitario}
                      onChange={(e) => handleChangeItem(index, "precioUnitario", parseFloat(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                      min={0}
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center">
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-500 hover:text-red-700 p-2 cursor-pointer transition-colors bg-red-50 rounded-lg"
                        title="Eliminar item"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
          >
            + Agregar Item
          </button>
        </div>

        <motion.button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-all duration-200 cursor-pointer font-semibold shadow-sm"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          Crear Venta
        </motion.button>
      </form>
    </div>
  );
}

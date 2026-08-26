import { useMemo, useState } from "react";
import { PlusCircleIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { blockNonNumericKey, sanitizeNumericString } from "../../../utils/numericInput";

interface SalesFormProps {
  products: any[];
  onSubmit: (saleData: any) => Promise<boolean>;
}

export default function SalesForm({ products, onSubmit }: SalesFormProps) {
  const [form, setForm] = useState({
    cliente: "",
    items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }],
  });

  // Texto de búsqueda visible en cada renglón (independiente del producto ya seleccionado)
  const [productQuery, setProductQuery] = useState<string[]>([""]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const getSelectedProduct = (item: { nombre: string }) =>
    products.find((p) => p.sku === item.nombre);

  const getMatches = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.marca?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  };

  const handleAddItem = () => {
    setForm({ ...form, items: [...form.items, { nombre: "", cantidad: 1, precioUnitario: 0 }] });
    setProductQuery([...productQuery, ""]);
  };

  const handleRemoveItem = (index: number) => {
    const copy = [...form.items];
    copy.splice(index, 1);
    setForm({ ...form, items: copy });

    const queryCopy = [...productQuery];
    queryCopy.splice(index, 1);
    setProductQuery(queryCopy);
  };

  const handleChangeItem = (index: number, field: string, value: string | number) => {
    const copy = [...form.items];
    copy[index] = { ...copy[index], [field]: value };
    setForm({ ...form, items: copy });
  };

  const handleSelectProduct = (index: number, product: any) => {
    const copy = [...form.items];
    copy[index] = { ...copy[index], nombre: product.sku, precioUnitario: product.precio };
    setForm({ ...form, items: copy });

    const queryCopy = [...productQuery];
    queryCopy[index] = product.nombre;
    setProductQuery(queryCopy);

    setOpenDropdown(null);
  };

  const handleProductQueryChange = (index: number, value: string) => {
    const queryCopy = [...productQuery];
    queryCopy[index] = value;
    setProductQuery(queryCopy);

    // Si el texto ya no corresponde al producto seleccionado, se limpia la selección
    const selected = getSelectedProduct(form.items[index]);
    if (selected && selected.nombre !== value) {
      handleChangeItem(index, "nombre", "");
    }
  };

  const total = useMemo(
    () => form.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0),
    [form.items]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.cliente.trim()) {
      Swal.fire({ icon: 'warning', title: 'Cliente faltante', text: 'Por favor ingresa el nombre del cliente.' });
      return;
    }

    if (form.items.some(item => !item.nombre.trim() || item.cantidad <= 0 || item.precioUnitario < 0)) {
      Swal.fire({ icon: 'warning', title: 'Items inválidos', text: 'Verifica que todos los items tengan un producto seleccionado del listado, cantidad mayor a 0 y precio válido.' });
      return;
    }

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
      setProductQuery([""]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 mb-6 flex items-center gap-3">
        <PlusCircleIcon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />
        <span>Registrar Nueva Venta</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block font-medium text-gray-700 dark:text-slate-300 mb-1">Cliente</label>
          <input
            type="text"
            required
            value={form.cliente}
            onChange={(e) => setForm({ ...form, cliente: e.target.value })}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-slate-50/50 dark:bg-slate-800/50 transition-colors"
            placeholder="Nombre del cliente"
          />
        </div>

        <div>
          <h3 className="font-medium text-gray-700 dark:text-slate-300 mb-2">Productos / Items</h3>
          <p className="font-light text-gray-500 dark:text-slate-400 mb-4 text-sm">Busca por nombre, código o marca y selecciona un producto del listado.</p>
          <AnimatePresence>
            {form.items.map((item, index) => {
              const selectedProduct = getSelectedProduct(item);
              const matches = getMatches(productQuery[index] ?? "");

              return (
                <motion.div
                  key={index}
                  className="flex flex-col gap-2 mb-4 p-4 border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid grid-cols-12 gap-3 items-end">
                    <div className="col-span-12 sm:col-span-5 relative">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Producto</label>
                      <div className="relative">
                        <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          value={productQuery[index] ?? ""}
                          onChange={(e) => handleProductQueryChange(index, e.target.value)}
                          onFocus={() => setOpenDropdown(index)}
                          onBlur={() => setTimeout(() => setOpenDropdown((cur) => (cur === index ? null : cur)), 150)}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                          placeholder="Buscar por nombre, código o marca..."
                          required
                          autoComplete="off"
                        />
                      </div>

                      {selectedProduct && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Código {selectedProduct.sku} · Stock disponible: {selectedProduct.stockDisponible}
                        </p>
                      )}

                      <AnimatePresence>
                        {openDropdown === index && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg"
                          >
                            {matches.length === 0 ? (
                              <p className="px-3 py-3 text-sm text-gray-500 dark:text-slate-400">
                                No se encontraron productos.
                              </p>
                            ) : (
                              matches.map((p) => (
                                <button
                                  type="button"
                                  key={p._id}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => handleSelectProduct(index, p)}
                                  className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 hover:dark:bg-indigo-900/30 transition-colors flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
                                >
                                  <span className="min-w-0">
                                    <span className="block text-sm font-medium text-gray-800 dark:text-slate-100 truncate">
                                      {p.nombre}
                                    </span>
                                    <span className="block text-xs text-gray-500 dark:text-slate-400">
                                      {p.sku} · Stock: {p.stockDisponible}
                                    </span>
                                  </span>
                                  <span className="shrink-0 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                    ${p.precio.toLocaleString("es-AR")}
                                  </span>
                                </button>
                              ))
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Cantidad</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Cant."
                        value={item.cantidad}
                        onKeyDown={(e) => blockNonNumericKey(e)}
                        onChange={(e) => {
                          const clean = sanitizeNumericString(e.target.value);
                          handleChangeItem(index, "cantidad", clean === "" ? 0 : parseInt(clean, 10));
                        }}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                        required
                      />
                    </div>
                    <div className="col-span-6 sm:col-span-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Precio Unit. ($)</label>
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="Precio"
                        value={item.precioUnitario}
                        onKeyDown={(e) => blockNonNumericKey(e, true)}
                        onChange={(e) => {
                          const clean = sanitizeNumericString(e.target.value, true);
                          handleChangeItem(index, "precioUnitario", clean === "" || clean === "." ? 0 : parseFloat(clean));
                        }}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                        required
                      />
                    </div>
                    <div className="col-span-12 sm:col-span-1 flex justify-end sm:justify-center">
                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 hover:dark:text-red-400 p-2 cursor-pointer transition-colors bg-red-50 dark:bg-red-900/30 rounded-lg"
                          title="Eliminar item"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {item.cantidad > 0 && item.precioUnitario > 0 && (
                    <p className="text-right text-sm text-gray-500 dark:text-slate-400">
                      Subtotal: <span className="font-semibold text-gray-700 dark:text-slate-200">${(item.cantidad * item.precioUnitario).toLocaleString("es-AR")}</span>
                    </p>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
          <button
            type="button"
            onClick={handleAddItem}
            className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:dark:text-indigo-400 font-semibold transition-colors"
          >
            + Agregar Item
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
          <span className="font-medium text-gray-700 dark:text-slate-300">Total</span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
            ${total.toLocaleString("es-AR")}
          </span>
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

import { useMemo, useState } from "react";
import { PlusCircleIcon, TrashIcon, MagnifyingGlassIcon, UserIcon } from "@heroicons/react/24/solid";
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
    items: [{ sku: "", nombre: "", cantidad: 1, precioUnitario: 0 }],
  });

  const [productQuery, setProductQuery] = useState<string[]>([""]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const getSelectedProduct = (item: { sku: string }) =>
    products.find((p) => p.sku === item.sku);

  // Filtrado por nombre, código SKU o categoría
  const getMatches = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 8);
    return products
      .filter(
        (p) =>
          p.nombre?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.categoria?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  };

  const handleAddItem = () => {
    setForm({
      ...form,
      items: [...form.items, { sku: "", nombre: "", cantidad: 1, precioUnitario: 0 }],
    });
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
    copy[index] = {
      ...copy[index],
      sku: product.sku,
      nombre: product.nombre,
      precioUnitario: product.precio,
    };
    setForm({ ...form, items: copy });

    const queryCopy = [...productQuery];
    queryCopy[index] = `${product.sku} - ${product.nombre}`;
    setProductQuery(queryCopy);

    setOpenDropdown(null);
  };

  const handleProductQueryChange = (index: number, value: string) => {
    const queryCopy = [...productQuery];
    queryCopy[index] = value;
    setProductQuery(queryCopy);

    // Si el texto ingresado no coincide con el producto seleccionado actualmente, resetea la selección
    const selected = getSelectedProduct(form.items[index]);
    if (
      selected &&
      `${selected.sku} - ${selected.nombre}` !== value &&
      selected.nombre !== value &&
      selected.sku !== value
    ) {
      handleChangeItem(index, "sku", "");
    }
  };

  const total = useMemo(
    () => form.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0),
    [form.items]
  );

  const handleClienteChange = (val: string) => {
    // Elimina números y restringe a un máximo de 50 caracteres
    const cleanValue = val.replace(/[0-9]/g, "").slice(0, 50);
    setForm({ ...form, cliente: cleanValue });
  };

  const handleClienteKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Bloquear ingreso de teclas numéricas
    if (e.key >= "0" && e.key <= "9") {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const clienteTrimmed = form.cliente.trim();
    if (!clienteTrimmed) {
      Swal.fire({ icon: 'warning', title: 'Cliente faltante', text: 'Por favor ingresa el nombre del cliente.' });
      return;
    }

    if (/\d/.test(form.cliente)) {
      Swal.fire({ icon: 'warning', title: 'Nombre inválido', text: 'El nombre del cliente no puede contener números.' });
      return;
    }

    if (clienteTrimmed.length < 2) {
      Swal.fire({ icon: 'warning', title: 'Nombre muy corto', text: 'El nombre del cliente debe contener al menos 2 letras.' });
      return;
    }

    if (form.items.some(item => !item.sku.trim() || item.cantidad <= 0 || item.precioUnitario < 0)) {
      Swal.fire({ icon: 'warning', title: 'Items inválidos', text: 'Verifica que todos los ítems tengan un producto seleccionado del listado, cantidad mayor a 0 y precio válido.' });
      return;
    }

    const saleData = {
      productos: form.items.map(item => ({
        productId: item.sku,
        quantity: item.cantidad,
        precioUnitario: item.precioUnitario
      })),
      total,
      fecha: new Date().toISOString(),
      cliente: clienteTrimmed,
    };

    const success = await onSubmit(saleData);
    if (success) {
      setForm({ cliente: "", items: [{ sku: "", nombre: "", cantidad: 1, precioUnitario: 0 }] });
      setProductQuery([""]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-full">
      <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3 tracking-tight">
        <PlusCircleIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
        <span>Registrar Nueva Venta</span>
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Campo Cliente */}
          <div className="bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cliente <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                {form.cliente.length}/50 caracteres (sólo letras)
              </span>
            </div>
            <div className="relative">
              <UserIcon className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                maxLength={50}
                value={form.cliente}
                onKeyDown={handleClienteKeyDown}
                onChange={(e) => handleClienteChange(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm font-medium transition-all shadow-xs"
                placeholder="Nombre del cliente (ej: Juan Pérez)..."
              />
            </div>
          </div>

          {/* Sección Productos / Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">Productos / Items</h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Busca por nombre o código SKU (ej: CAL-001)
              </span>
            </div>

            <div className="space-y-4">
              {form.items.map((item, index) => {
                const selectedProduct = getSelectedProduct(item);
                const matches = getMatches(productQuery[index] ?? "");
                const subtotalItem = item.cantidad * item.precioUnitario;

                return (
                  <div
                    key={index}
                    className="bg-slate-50/80 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col gap-4 shadow-xs relative"
                  >
                    {/* Encabezado del Item */}
                    <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/60 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold px-2.5 py-1 rounded-lg">
                          Ítem #{index + 1}
                        </span>
                        {selectedProduct && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Código: <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedProduct.sku}</strong> · Stock disponible: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{selectedProduct.stockDisponible}</strong>
                          </span>
                        )}
                      </div>

                      {form.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          title="Eliminar este ítem"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* Campos de entrada alineados */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      {/* Búsqueda de Producto */}
                      <div className="md:col-span-6 relative">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Producto (Nombre o Código SKU)
                        </label>
                        <div className="relative">
                          <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="text"
                            value={productQuery[index] ?? ""}
                            onChange={(e) => handleProductQueryChange(index, e.target.value)}
                            onFocus={() => setOpenDropdown(index)}
                            onBlur={() => setTimeout(() => setOpenDropdown((cur) => (cur === index ? null : cur)), 180)}
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                            placeholder="Buscar por nombre (ej: Zapatilla) o código (ej: CAL-001)..."
                            required
                            autoComplete="off"
                          />
                        </div>

                        {/* Dropdown flotante de sugerencias */}
                        <AnimatePresence>
                          {openDropdown === index && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-30 mt-1 w-full max-h-64 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl divide-y divide-slate-100 dark:divide-slate-800"
                            >
                              {matches.length === 0 ? (
                                <p className="px-3 py-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                                  No se encontraron productos con esa búsqueda.
                                </p>
                              ) : (
                                matches.map((p) => (
                                  <button
                                    type="button"
                                    key={p._id}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => handleSelectProduct(index, p)}
                                    className="w-full text-left px-3.5 py-2.5 hover:bg-indigo-50/70 hover:dark:bg-indigo-950/40 transition-colors flex items-center justify-between gap-3"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                        {p.nombre}
                                      </span>
                                      <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                        Código: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{p.sku}</span> · Stock: {p.stockDisponible}
                                      </span>
                                    </div>
                                    <span className="shrink-0 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
                                      ${p.precio.toLocaleString("es-AR")}
                                    </span>
                                  </button>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Cantidad */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Cantidad
                        </label>
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
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                          required
                        />
                      </div>

                      {/* Precio Unitario */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Precio Unit. ($)
                        </label>
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
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs font-semibold text-right focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                          required
                        />
                      </div>

                      {/* Subtotal */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                          Subtotal
                        </label>
                        <div className="w-full border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-3 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold text-right shadow-xs truncate">
                          ${subtotalItem.toLocaleString("es-AR")}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddItem}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 px-3.5 py-2 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 transition-all cursor-pointer shadow-xs"
            >
              <PlusCircleIcon className="w-4 h-4" />
              <span>Agregar Producto</span>
            </button>
          </div>
        </div>

        {/* Resumen Total y Botón de Envío */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700 mt-6">
          <div className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-base">Total de la Venta</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              ${total.toLocaleString("es-AR")}
            </span>
          </div>

          <motion.button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-4 rounded-2xl font-extrabold text-sm shadow-md transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
          >
            Registrar Venta
          </motion.button>
        </div>
      </form>
    </div>
  );
}

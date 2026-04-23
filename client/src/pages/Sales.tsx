"use client";
import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { listSales, createSale, updateSaleStatus} from "../services/salesServices";
import { listProducts } from "../services/productsService";
import ProductStockList from "./Products/ListProducts";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { ShoppingCart } from "lucide-react";


export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [, setLoading] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false);

  const [form, setForm] = useState({
    cliente: "",
    items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }],
  });

    useEffect(() => {
        fetchSales();
        fetchProducts();
    }, []);

  const fetchProducts = async () => {
    try {
        const data = await listProducts();
        setProducts(data);
    } catch (error) {
        console.error("Error fetching products:", error);
    }
  };

  const fetchSales = async () => {
    setLoading(true);
    try {     
        const data = await listSales();
        setSales(data);
    } catch (error) {
        console.error("Error fetching sales:", error);
    } finally {
        setLoading(false);
    }
};

//Metodo para actualizar el estado de una venta
const handleUpdateStatus = async (id: string, estado: Sale["estado"]) => {
  try {
    await updateSaleStatus(id, estado);
    await fetchSales();
    Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: `La venta fue marcada como ${estado}`,
      timer: 1200,
      showConfirmButton: false,
    });
  } catch {
    Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado" });
  }
};

const handleAddItem = () => {
  setForm({ ...form, items: [...form.items, { nombre: "", cantidad: 1, precioUnitario: 0 }] });
};

interface Item {
    product: string;
    cantidad: number;
    precioUnitario: number;
    nombre: string;
}

interface Sale {
    _id: string;
    cliente: string;
    fecha: string;
    total: number;
    estado: "CREADA" | "PAGADA" | "FACTURADA" | "CANCELADA";
    items: Item[];
    notas: string;
}

const handleRemoveItem = (index: number) => {
    const copy = [...form.items];
    copy.splice(index, 1);
    setForm({ ...form, items: copy });
};

  type ItemField = "nombre" | "cantidad" | "precioUnitario";

  const handleChangeItem = (index: number, field: ItemField, value: string | number) => {
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

    try {
      setLoading(true);
      const total = form.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

      const saleData = {
        productos: form.items.map(item => ({
          productId:  item.nombre, // Ajusta según tu backend
          quantity: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        total,
        fecha: new Date().toISOString(),
        cliente: form.cliente,
      };

      await createSale(saleData);
      Swal.fire({
        icon: "success",
        title: "Venta registrada",
        text: "La venta ha sido creada exitosamente.",
      });
      
      // Recargar ventas después de crear
      await fetchSales();
      setRefreshProducts(!refreshProducts); // Refrescar lista de productos
      
      // Resetear formulario
      setForm({ cliente: "", items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }] });
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.message || "Ocurrió un error al crear la venta.";
      Swal.fire({
        icon: "error",
        title: "No se pudo registrar la venta",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 flex flex-col gap-8 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Ventas y Clientes</h1>
        </div>
        <p className="text-lg text-slate-500 font-medium mt-2">
          Gestión de las ventas realizadas y relaciones con clientes.
        </p>
      </motion.div>

      {/* Resumen */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-4 gap-4"
      >
        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-xl border border-slate-100 p-5 flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm text-slate-500 font-medium">Ventas Activas</h2>
            <p className="text-2xl font-bold text-indigo-600">
              {sales.length}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-xl border border-slate-100 p-5 flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-blue-100 rounded-lg">
            <UserIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm text-slate-500 font-medium">Clientes</h2>
            <p className="text-2xl font-bold text-blue-500">
              {new Set(sales.map((s) => s.cliente)).size}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-xl border border-slate-100 p-5 flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircleIcon className="h-6 w-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-sm text-slate-500 font-medium">Pagadas</h2>
            <p className="text-2xl font-bold text-emerald-600">
              {sales.filter((s) => s.estado === "PAGADA" || s.estado === "FACTURADA").length}
            </p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-xl border border-slate-100 p-5 flex items-center space-x-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-amber-100 rounded-lg">
            <ClockIcon className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-sm text-slate-500 font-medium">Pendientes</h2>
            <p className="text-2xl font-bold text-amber-600">
              {sales.filter((s) => s.estado === "CREADA").length}
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Lista de productos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <ProductStockList refresh={refreshProducts} />
      </motion.div>

      {/* Contenedor principal (form + lista) */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* --- Formulario Nueva Venta --- */}
        <motion.div variants={itemVariants} className="bg-white shadow-sm rounded-2xl border border-slate-100 p-6 flex flex-col overflow-y-auto max-h-[75vh]">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
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
              <p className="font-light text-gray-500 mb-4 text-sm">Se debe colocar el código de un producto que esté presente en el listado de arriba.</p>
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
                        <label className="block text-xs font-medium text-gray-500 mb-1">Código o Nombre del producto</label>
                        <input
                          type="text"
                          placeholder="Escribe para buscar..."
                          list="products-list"
                          value={item.nombre}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleChangeItem(index, "nombre", val);
                            
                            // Si el valor coincide exactamente con un SKU o nombre, autocompletar precio
                            const matchedProd = products.find(p => p.sku === val || p.nombre === val);
                            if (matchedProd) {
                              handleChangeItem(index, "precioUnitario", matchedProd.precio);
                            }
                          }}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-colors"
                          required
                        />
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

              <datalist id="products-list">
                {products.map(p => (
                  <option key={p._id} value={p.sku}>{p.nombre} - ${p.precio}</option>
                ))}
              </datalist>
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
        </motion.div>

        {/* --- Lista de Ventas --- */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-y-auto max-h-[75vh]">
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
                        onClick={() => handleUpdateStatus(sale._id, "PAGADA")} 
                        className="text-green-600 hover:text-green-800 cursor-pointer p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button 
                        onClick={() => handleUpdateStatus(sale._id, "FACTURADA")} 
                        className="text-purple-600 hover:text-purple-800 cursor-pointer p-1.5 rounded-lg hover:bg-purple-50 transition-colors"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <CurrencyDollarIcon className="h-5 w-5" />
                      </motion.button>
                      <motion.button 
                        onClick={() => handleUpdateStatus(sale._id, "CANCELADA")} 
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
                    <strong>Notas: </strong>
                    {sale.notas}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

      </motion.div>

    </div>
  );
}
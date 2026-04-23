"use client";
import { useEffect, useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  FunnelIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import {
  listProducts,
  createProduct,
  updateProduct,
} from "../services/productsService";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Package } from "lucide-react";

interface Product {
  _id: string;
  sku: string;
  nombre: string;
  marca?: string;
  categoria: string;
  stockDisponible: number;
  stockMinimo: number;
  precio: number;
  imageUrl?: string;
}

type StockStatus = "Normal" | "Crítico" | "Sin Stock";

export default function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas las categorías");
  const [statusFilter, setStatusFilter] = useState("Todos los estados");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  //Inicializamos los cmapos a usar en vacio
  const [form, setForm] = useState({
    sku: "",
    nombre: "",
    marca: "",
    categoria: "",
    stockDisponible: 0,
    stockMinimo: 0,
    precio: 0,
    imageUrl: "",
  });

  // Cargar productos al montar el componente

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Determinar el estado del stock de un producto

  const getStockStatus = (product: Product): StockStatus => {
    if (product.stockDisponible === 0) return "Sin Stock";
    if (product.stockDisponible <= product.stockMinimo) return "Crítico";
    return "Normal";
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case "Normal":
        return "bg-green-100 text-green-700";
      case "Crítico":
        return "bg-yellow-100 text-yellow-700";
      case "Sin Stock":
        return "bg-red-100 text-red-700";
    }
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case "Normal":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "Crítico":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />;
      case "Sin Stock":
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
    }
  };

  const stats = {
    total: products.length,
    normal: products.filter((p) => getStockStatus(p) === "Normal").length,
    bajo: products.filter((p) => getStockStatus(p) === "Crítico").length,
    sinStock: products.filter((p) => getStockStatus(p) === "Sin Stock").length,
  };
  

  const categories = [
    "Todas las categorías",
    ...Array.from(new Set(products.map((p) => p.categoria))),
  ];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.marca?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "Todas las categorías" ||
      product.categoria === categoryFilter;

    const status = getStockStatus(product);
    const matchesStatus =
      statusFilter === "Todos los estados" ||
      (statusFilter === "Normal" && status === "Normal") ||
      (statusFilter === "Crítico" && status === "Crítico") ||
      (statusFilter === "Sin Stock" && status === "Sin Stock");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setForm({
        sku: product.sku,
        nombre: product.nombre,
        marca: product.marca || "",
        categoria: product.categoria,
        stockDisponible: product.stockDisponible,
        stockMinimo: product.stockMinimo,
        precio: product.precio,
        imageUrl: product.imageUrl || "",
      });
    } else {
      setEditingProduct(null);
      setForm({
        sku: "",
        nombre: "",
        marca: "",
        categoria: "",
        stockDisponible: 0,
        stockMinimo: 0,
        precio: 0,
        imageUrl: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.sku || !form.nombre || !form.categoria || form.precio === undefined || form.stockDisponible === undefined || form.stockMinimo === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, completa todos los campos obligatorios.'
      });
      return;
    }

    if (form.precio <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Precio inválido',
        text: 'El precio del producto debe ser mayor a 0.'
      });
      return;
    }

    if (form.stockDisponible < 0 || form.stockMinimo < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock inválido',
        text: 'Los valores de stock no pueden ser negativos.'
      });
      return;
    }

    setLoading(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct._id, form);

        Swal.fire({
            title: "Producto actualizado",
            text: "El producto ha sido actualizado exitosamente",
            icon: "success"
        });

      } else {
        await createProduct({
          sku: form.sku,
          nombre: form.nombre,
          precio: form.precio,
          stockDisponible: form.stockDisponible,
          stockMinimo: form.stockMinimo,
          categoria: form.categoria,
          imageUrl: form.imageUrl,
        });

        
        Swal.fire({
            title: "Producto creado",
            text: "El nuevo producto ha sido creado exitosamente",
            icon: "success"
        });
      }

      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
        Swal.fire({
            icon: "error",
            title: "Error al guardar el producto",
            text: "Hubo un problema al guardar el producto. Por favor, intenta nuevamente.",
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

  const rowVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8 font-sans">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-start mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-teal-100 text-teal-600 rounded-xl shadow-sm">
              <Package className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestión de Stock</h1>
          </div>
          <p className="text-lg text-slate-500 font-medium mt-2">
            Control de inventario con alertas automáticas
          </p>
        </div>
        <motion.button
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-sm transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6"
      >
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-teal-100 rounded-lg">
            <CubeIcon className="h-7 w-7 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircleIcon className="h-7 w-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Stock Normal</p>
            <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <ExclamationTriangleIcon className="h-7 w-7 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Stock Bajo</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.bajo}</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="p-2 bg-red-100 rounded-lg">
            <XCircleIcon className="h-7 w-7 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Crítico/Sin Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.sinStock}</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 mb-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-teal-100 rounded-lg">
            <FunnelIcon className="h-5 w-5 text-teal-600" />
          </div>
          <h2 className="font-semibold text-gray-900">Filtros y Búsqueda</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
          >
            <option>Todos los estados</option>
            <option>Normal</option>
            <option>Crítico</option>
            <option>Sin Stock</option>
          </select>
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div 
        className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-gray-900">Inventario Actual</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Stock Mín.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      Cargando productos...
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, i) => {
                  const status = getStockStatus(product);
                  return (
                    <motion.tr 
                      key={product._id} 
                      className="hover:bg-slate-50/70 transition-colors"
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.03 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span
                            className={'px-2 py-1 text-xs font-medium rounded-full ' + getStatusColor(status)}
                          >
                            {status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.nombre}
                          </div>
                          {product.marca && (
                            <div className="text-sm text-gray-500">
                              {product.marca}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.categoria}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={'text-sm font-semibold ' + (
                            product.stockDisponible === 0
                              ? "text-red-600"
                              : product.stockDisponible <= product.stockMinimo
                              ? "text-yellow-600"
                              : "text-green-600"
                          )}
                        >
                          {product.stockDisponible}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.stockMinimo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ${product.precio.toLocaleString("es-AR")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <motion.button
                            onClick={() => handleOpenModal(product)}
                            className="text-gray-600 hover:text-gray-900 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <PencilIcon className="h-5 w-5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Editar Producto" : "Nuevo Producto"}
                </h2>
                <motion.button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XCircleIcon className="h-6 w-6" />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      maxLength={5}
                      minLength={1}
                      required
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      minLength={1}
                      required
                      value={form.categoria}
                      onChange={(e) =>
                        setForm({ ...form, categoria: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    minLength={1}
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    minLength={1}
                    value={form.marca}
                    onChange={(e) => setForm({ ...form, marca: e.target.value })}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Disponible
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={form.stockDisponible}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockDisponible: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock Mínimo
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="10"
                      value={form.stockMinimo}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockMinimo: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="1000000"
                      step="0.01"
                      value={form.precio}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          precio: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-gray-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:bg-gray-400 transition-colors font-medium shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading
                      ? "Guardando..."
                      : editingProduct
                      ? "Actualizar"
                      : "Crear Producto"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
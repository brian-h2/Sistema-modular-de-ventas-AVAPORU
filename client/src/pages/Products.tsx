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

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Stock</h1>
          <p className="text-gray-600 mt-1">
            Control de inventario con alertas automáticas
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Producto
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <CubeIcon className="h-8 w-8 text-teal-600" />
          <div>
            <p className="text-gray-500 text-sm">Total Productos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-gray-500 text-sm">Stock Normal</p>
            <p className="text-2xl font-bold text-green-600">{stats.normal}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
          <div>
            <p className="text-gray-500 text-sm">Stock Bajo</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.bajo}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-3">
          <XCircleIcon className="h-8 w-8 text-red-600" />
          <div>
            <p className="text-gray-500 text-sm">Crítico/Sin Stock</p>
            <p className="text-2xl font-bold text-red-600">{stats.sinStock}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FunnelIcon className="h-5 w-5 text-teal-600" />
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option>Todos los estados</option>
            <option>Normal</option>
            <option>Crítico</option>
            <option>Sin Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Inventario Actual</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Actual
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Mín.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No se encontraron productos
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getStockStatus(product);
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              status
                            )}`}
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
                          className={`text-sm font-semibold ${
                            product.stockDisponible === 0
                              ? "text-red-600"
                              : product.stockDisponible <= product.stockMinimo
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
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
                          <button
                            onClick={() => handleOpenModal(product)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          {/* <button className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 rounded p-1">
                            <PlusIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 bg-red-50 rounded p-1">
                            <TrashIcon className="h-4 w-4" />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2 rounded">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Reporte de Stock</h3>
              <p className="text-sm text-gray-500">Generar reporte completo</p>
            </div>
          </div>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
            Generar Reporte
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2 rounded">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Productos Top</h3>
              <p className="text-sm text-gray-500">Más vendidos del mes</p>
            </div>
          </div>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
            Ver Análisis
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Stock Crítico</h3>
              <p className="text-sm text-gray-500">Órdenes de reposición</p>
            </div>
          </div>
          <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50">
            Generar Órdenes
          </button>
        </div>
      </div> */}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? "Editar Producto" : "Nuevo Producto"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    value={form.sku}
                    onChange={(e) =>
                      setForm({ ...form, sku: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    required
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={form.marca}
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    value={form.stockDisponible}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stockDisponible: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    value={form.stockMinimo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        stockMinimo: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                    step="0.01"
                    value={form.precio}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        precio: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400"
                >
                  {loading
                    ? "Guardando..."
                    : editingProduct
                    ? "Actualizar"
                    : "Crear Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
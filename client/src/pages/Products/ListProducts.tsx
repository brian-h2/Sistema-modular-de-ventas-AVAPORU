"use client";
import { useEffect, useState } from "react";
import { listProducts } from "../../services/productsService";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import Pagination from "../../components/ui/Pagination";

interface Product {
  _id: string;
  sku: string;
  nombre: string;
  categoria: string;
  precio: number;
  stockDisponible: number;
  stockMinimo: number;
}

export default function ProductStockList({ refresh = false }: { refresh?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  useEffect(() => {
    fetchProducts();
  }, [refresh]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error al obtener productos:", err);
      setError("Error al cargar los productos 😢");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (p: Product) => {
    if (p.stockDisponible === 0)
      return {
        text: "Sin Stock",
        color: "text-red-600 dark:text-red-400",
        icon: <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />,
      };
    if (p.stockDisponible <= p.stockMinimo)
      return {
        text: "Crítico",
        color: "text-yellow-600 dark:text-yellow-400",
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
      };
    return {
      text: "Normal",
      color: "text-green-600 dark:text-green-400",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />,
    };
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStock = true;
    if (stockFilter === "NORMAL") matchesStock = p.stockDisponible > p.stockMinimo;
    else if (stockFilter === "CRITICO") matchesStock = p.stockDisponible > 0 && p.stockDisponible <= p.stockMinimo;
    else if (stockFilter === "SIN_STOCK") matchesStock = p.stockDisponible === 0;

    return matchesSearch && matchesStock;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, stockFilter, pageSize]);

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-white dark:bg-slate-900 shadow rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1 flex items-center space-x-2 text-slate-900 dark:text-slate-100">
            <span>Productos en stock</span>
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Listado de productos disponibles para la venta.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm w-full sm:w-64"
          />
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900"
          >
            <option value="TODOS">Todo el stock</option>
            <option value="NORMAL">Normal</option>
            <option value="CRITICO">Crítico</option>
            <option value="SIN_STOCK">Sin Stock</option>
          </select>
        </div>
      </div>

      {loading && (
        <p className="text-gray-500 dark:text-slate-400 text-sm animate-pulse">Cargando productos...</p>
      )}

      {error && (
        <p className="text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500 dark:text-slate-400">No hay productos disponibles.</p>
      )}

      {!loading && !error && products.length > 0 && filteredProducts.length === 0 && (
        <p className="text-gray-500 dark:text-slate-400">No hay productos que coincidan con la búsqueda.</p>
      )}

      {!loading && filteredProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 text-sm uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Producto</th>
                <th className="px-4 py-3 text-left">Categoría</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Stock Mínimo</th>
                <th className="px-4 py-3 text-left">Precio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedProducts.map((p) => {
                const status = getStockStatus(p);

                return (
                  <tr key={p._id} className="hover:bg-gray-50 hover:dark:bg-slate-800">
                    <td className="px-4 py-3 flex items-center space-x-1">
                      {status.icon}
                      <span className={`font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700 dark:text-slate-300">
                       {p.sku || "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-800 dark:text-slate-200">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-800 dark:text-slate-200">{p.categoria}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        p.stockDisponible === 0
                          ? "text-red-600 dark:text-red-400"
                          : p.stockDisponible <= p.stockMinimo
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {p.stockDisponible}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{p.stockMinimo}</td>
                    <td className="px-4 py-3 font-medium text-indigo-700 dark:text-indigo-400">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredProducts.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
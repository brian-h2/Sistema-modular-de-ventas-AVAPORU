"use client";
import { useEffect, useState } from "react";
import { listProducts } from "../../services/productsService";
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

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
        color: "text-red-600",
        icon: <XCircleIcon className="h-5 w-5 text-red-600" />,
      };
    if (p.stockDisponible <= p.stockMinimo)
      return {
        text: "Crítico",
        color: "text-yellow-600",
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />,
      };
    return {
      text: "Normal",
      color: "text-green-600",
      icon: <CheckCircleIcon className="h-5 w-5 text-green-600" />,
    };
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <h2 className="text-xl font-semibold mb-2 flex items-center space-x-2">
        <span>Productos en stock</span>
      </h2>
      <p className="text-gray-600 mb-4">
        Listado de productos disponibles para la venta.
      </p>

      {loading && (
        <p className="text-gray-500 text-sm animate-pulse">Cargando productos...</p>
      )}

      {error && (
        <p className="text-red-600 font-medium bg-red-50 px-3 py-2 rounded-md">
          {error}
        </p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-500">No hay productos disponibles.</p>
      )}

      {!loading && products.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
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
              {products.map((p) => {
                const status = getStockStatus(p);
                
                    const sku = p.sku || "—";
                    const nombre = p.nombre || "Sin nombre";
                    const categoria = p.categoria || "General";
                    const precio = Number(p.precio) || 0;
                    const stock = Number(p.stockDisponible) || 0;
                    const stockMinimo = Number(p.stockMinimo) || 0;

                return (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 flex items-center space-x-1">
                      {status.icon}
                      <span className={`font-medium ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-700">
                       {p.sku || "—"}
                    </td>
                    <td className="px-4 py-3">{p.nombre}</td>
                    <td className="px-4 py-3">{p.categoria}</td>
                    <td
                      className={`px-4 py-3 font-semibold ${
                        p.stockDisponible === 0
                          ? "text-red-600"
                          : p.stockDisponible <= p.stockMinimo
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {p.stockDisponible}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.stockMinimo}</td>
                    <td className="px-4 py-3 font-medium text-indigo-700">
                      ${p.precio.toLocaleString("es-AR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
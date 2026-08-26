"use client"
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../Card";
import { useNavigate } from "react-router-dom";

interface Product {
    _id: string;
    nombre: string;
    stockDisponible: number;
    stockMinimo: number;
    categoria?: string;
}

interface ProductsStockListProps {
    products: Product[];
}


export default function ProductsStockList({ products }: ProductsStockListProps) {
    const navigate = useNavigate();

    const { 
        alerts  
        } = useMemo(() => {
        const lowStockProducts = products.filter(p => p.stockDisponible > 0 && p.stockDisponible <= p.stockMinimo);
        const criticalProducts = products.filter(p => p.stockDisponible === 0);
        const alerts = [...criticalProducts, ...lowStockProducts];
        return { alerts };
    }, [products]);

    
  return (
      <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            Alertas de Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {alerts.length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                No hay productos con stock bajo o crítico 👌
              </p>
            )}
            {alerts.map((prod) => (
              <div key={prod._id} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{prod.nombre}</p>
                    <p className="text-xs text-gray-600 dark:text-slate-400">
                      {prod.categoria || "Sin categoría"}
                    </p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-slate-100">{prod.stockDisponible}</p>
                    <span
                        className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          prod.stockDisponible <= 5
                            ? "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-400 border-red-300"
                            : "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-400 border-yellow-300"
                        }`}
                      >
                        {prod.stockDisponible  <= 5 ? "Crítico" : "Bajo"}
                    </span>
                  </div>
              </div>
            ))}

            <button  
                className="w-full bg-white dark:bg-slate-900 rounded-2xl font-bold cursor-pointer shadow-md hover:bg-gray-200 hover:dark:bg-slate-700 text-gray-800 dark:text-slate-100 py-2 px-4 hover:shadow-lg transition-all  duration-300 mt-4"
                onClick={() => navigate('/stock')}
              >
                Ver todo el stock
            </button>      
        </CardContent>
      </Card>
  );
}
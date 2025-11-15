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

    
  if (alerts.length === 0) {
    return (
      <p className="text-gray-500 text-sm px-6 pb-6">
        No hay productos con stock bajo o crítico 👌
      </p>
    );
  }

  return (
      <Card className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6"> 
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Alertas de Stock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            {alerts.map((prod) => (
              <div key={prod._id} className="flex items-center justify-between p-3 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{prod.nombre}</p>
                    <p className="text-xs text-gray-600">
                      {prod.categoria || "Sin categoría"}
                    </p>
                </div>
                <div className="text-center">
                  <p className="font-bold">{prod.stockDisponible}</p>
                    <span
                        className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium ${
                          prod.stockDisponible <= 5
                            ? "bg-red-100 text-red-800 border-red-300"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }`}
                      >
                        {prod.stockDisponible  <= 5 ? "Crítico" : "Bajo"}
                    </span>
                  </div>
              </div>
            ))}

            <button  
                className="w-full bg-white rounded-2xl font-bold cursor-pointer shadow-md hover:bg-gray-200 text-gray-800 py-2 px-4 hover:shadow-lg transition-all  duration-300 mt-4"
                onClick={() => navigate('/stock')}
              >
                Ver todo el stock
            </button>      
        </CardContent>
      </Card>
  );
}
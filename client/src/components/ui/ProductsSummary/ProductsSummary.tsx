"use client"
import { useMemo } from "react";

interface Product {
    _id: string;
    nombre: string;
    stockDisponible: number;
    stockMinimo: number;
    categoria?: string;
}

interface ProductsSummaryCardProps {
    products: Product[];
}


export default function ProductsSummaryCard({ products }: ProductsSummaryCardProps) {

    //Use memo permite memorizar valores calculados para optimizar el rendimiento
    const { productosCriticos,
          } = useMemo(() => { 

        const totalProductos = products.length;
        const productosCriticos = products.filter(p => p.stockDisponible < p.stockMinimo).length;
        const porcentajeCriticos = totalProductos > 0 ? (productosCriticos / totalProductos) * 100 : 0;

        return { totalProductos, productosCriticos, porcentajeCriticos };
        }, [products]);

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
            <h1 className="text-lg font-semibold text-gray-700 mb-6">Stock crítico ⚠️</h1>
            <p className="text-2xl font-bold text-yellow-600">{productosCriticos ? productosCriticos : 0}</p>
            <p className="text-sm text-gray-500 mt-1">Productos en falta</p>
        </div>
    );

}
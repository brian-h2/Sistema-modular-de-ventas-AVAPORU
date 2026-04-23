"use client";
import { useMemo } from "react";

interface Sale {
  fecha: string;
  total: number;
}

interface SalesSummaryCardProps {
  sales: Sale[];
}

export default function SalesSummaryCard({ sales }: SalesSummaryCardProps) {

  //Use memo permite memorizar valores calculados para optimizar el rendimiento
  const { totalHoy,
    totalAyer,
    variacionVentas,
    tendenciaVentas,
    ordenesHoy,
    ordenesAyer,
    variacionOrdenes,
    tendenciaOrdenes,
  } = useMemo(() => {

    //Obtenemos fechas de hoy y ayer
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Función para comparar si dos fechas son el mismo día
    const isSameDay = (dateA: Date, dateB: Date) =>
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate();

    //Filtramos por fechas de hoy y ayer
    const ventasHoy = sales.filter((s) => isSameDay(new Date(s.fecha), today));
    const ventasAyer = sales.filter((s) => isSameDay(new Date(s.fecha), yesterday));

    //calcular totales
    const totalHoy = ventasHoy.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totalAyer = ventasAyer.reduce((acc, s) => acc + Number(s.total || 0), 0);

    //calculamos ordenes procesadas
    const ordenesHoy = ventasHoy.length;
    const ordenesAyer = ventasAyer.length;

    //calculamos variacion de ordenes
    let variacionOrdenes = 0;
    if (ordenesAyer > 0) variacionOrdenes = ((ordenesHoy - ordenesAyer) / ordenesAyer) * 100;

    let variacionVentas = 0;
    //Validamos si totalAyer es mayor a 0 para evitar division por 0
    if (totalAyer > 0) variacionVentas = ((totalHoy - totalAyer) / totalAyer) * 100;

    const tendenciaVentas =
      variacionVentas > 0 ? "Aumentó" : variacionVentas < 0 ? "Descendió" : "Se mantuvo igual";

    const tendenciaOrdenes =
      variacionOrdenes > 0 ? "Aumentaron" : variacionOrdenes < 0 ? "Descendieron" : "Se mantuvieron iguales";


    return { totalHoy, totalAyer, variacionVentas, tendenciaVentas, ordenesHoy, ordenesAyer, variacionOrdenes, tendenciaOrdenes };
  }, [sales]);

  return (
    <>
      {/* Ventas del día */}
      <div className="bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
        <h1 className="text-lg font-semibold text-white mb-6">Ventas del día 💲</h1>
        <p className="text-2xl font-bold text-white">
          ${totalHoy.toLocaleString("es-AR")}
        </p>
        <p className="text-sm text-white mt-1">
          {totalAyer === 0 ? (
            <span>No hay registros de ayer</span>
          ) : (
            <>
              Comparado con ayer:{" "}
              <span
                className={`font-medium ${variacionVentas > 0
                    ? "text-green-200"
                    : variacionVentas < 0
                      ? "text-red-200"
                      : "text-white"
                  }`}
              >
                {tendenciaVentas} {Math.abs(variacionVentas).toFixed(1)}%
              </span>
            </>
          )}
        </p>
      </div>

      {/* Órdenes procesadas */}
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
        <h1 className="text-lg font-semibold text-gray-700 mb-6">Órdenes procesadas 📈</h1>
        <p className="text-2xl font-bold text-blue-600">{ordenesHoy}</p>
        <p className="text-sm text-gray-500 mt-1">
          {ordenesAyer === 0 ? (
            <span>No hay registros de ayer</span>
          ) : (
            <>
              <span
                className={`font-medium ${variacionOrdenes > 0
                    ? "text-black-200"
                    : variacionOrdenes < 0
                      ? "text-black-200"
                      : "text-black"
                  }`}
              >
                {tendenciaOrdenes} {Math.abs(variacionOrdenes).toFixed(1)}%
              </span>
            </>
          )}
        </p>
      </div>
    </>
  );
}

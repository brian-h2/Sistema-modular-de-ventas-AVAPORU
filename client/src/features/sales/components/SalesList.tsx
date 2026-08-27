import { useEffect, useState } from "react";
import {
  CurrencyDollarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";

import type { Sale } from "../types";
import Pagination from "../../../components/ui/Pagination";
import { payWithMercadoPago } from "../../../services/paymentsService";

interface SalesListProps {
  sales: Sale[];
  onUpdateStatus: (id: string, status: Sale["estado"]) => void;
}

export default function SalesList({
  sales,
  onUpdateStatus,
}: SalesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  /*
   * ============================================================
   * ESTILOS DE ESTADO Y MÉTODO DE PAGO
   * ============================================================
   */

  const getStatusBadge = (estado: Sale["estado"]) => {
    const styles: Record<string, string> = {
      CREADA:
        "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",

      PAGADA:
        "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",

      FACTURADA:
        "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",

      CANCELADA:
        "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    };

    return (
      styles[estado] ||
      "bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300"
    );
  };

  const getPaymentMethodBadge = (metodo?: string) => {
    switch (metodo) {
      case "MERCADO_PAGO":
        return {
          label: "Mercado Pago",
          className:
            "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-200/80 dark:border-sky-800/80",
          icon: "💳",
        };
      case "TRANSFERENCIA":
        return {
          label: "Transferencia",
          className:
            "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 border-purple-200/80 dark:border-purple-800/80",
          icon: "🏦",
        };
      case "TARJETA_DEBITO":
        return {
          label: "T. Débito",
          className:
            "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-800/80",
          icon: "💳",
        };
      case "TARJETA_CREDITO":
        return {
          label: "T. Crédito",
          className:
            "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border-blue-200/80 dark:border-blue-800/80",
          icon: "💳",
        };
      case "OTRO":
        return {
          label: "Otro medio",
          className:
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
          icon: "🔄",
        };
      case "EFECTIVO":
      default:
        return {
          label: "Efectivo",
          className:
            "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/80",
          icon: "💵",
        };
    }
  };

  /*
   * ============================================================
   * FORMATO DE FECHA
   * ============================================================
   */

  const formatDateDDMMYYYY = (
    dateInput: string | Date
  ): string => {
    if (!dateInput) return "";

    const dateStr =
      typeof dateInput === "string"
        ? dateInput
        : dateInput.toISOString();

    /*
     * Si ya viene con formato:
     * YYYY-MM-DD...
     */
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      const [year, month, day] =
        dateStr.slice(0, 10).split("-");

      return `${day}/${month}/${year}`;
    }

    const d = new Date(dateInput);

    if (isNaN(d.getTime())) {
      return String(dateInput);
    }

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(
      d.getMonth() + 1
    ).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  /*
   * ============================================================
   * FILTRADO
   * ============================================================
   */

  const filteredSales = sales.filter((sale) => {
    const cliente =
      sale.cliente || "";

    const matchesSearch =
      cliente
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        );

    const matchesStatus =
      statusFilter === "TODOS" ||
      sale.estado === statusFilter;

    const saleDate =
      new Date(sale.fecha)
        .toISOString()
        .slice(0, 10);

    const matchesFrom =
      !dateFrom ||
      saleDate >= dateFrom;

    const matchesTo =
      !dateTo ||
      saleDate <= dateTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesFrom &&
      matchesTo
    );
  });

  /*
   * Volver a página 1 cuando cambian filtros.
   */
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    statusFilter,
    dateFrom,
    dateTo,
    pageSize,
  ]);

  /*
   * ============================================================
   * PAGINACIÓN
   * ============================================================
   */

  const paginatedSales =
    filteredSales.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );

  /*
   * ============================================================
   * MERCADO PAGO
   * ============================================================
   *
   * CREADA
   *    ↓
   * Genera Preference
   *    ↓
   * Checkout Pro
   */

  const pagarConMercadoPago = async (saleId: string) => {
    try {
      Swal.fire({
        title: "Iniciando Mercado Pago...",
        text: "Generando preferencia de pago...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await payWithMercadoPago(saleId);
    } catch (error) {
      console.error("Error iniciando Mercado Pago:", error);
      Swal.fire({
        icon: "error",
        title: "No se pudo iniciar el pago",
        text: error instanceof Error ? error.message : "Error al conectar con Mercado Pago",
      });
    }
  };

/*
 * ============================================================
 * GENERAR COMPROBANTE
 * ============================================================
 */

const generarComprobante =
  async (
    saleId: string
  ) => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );


      if (!token) {
        alert(
          "No se encontró el token de sesión."
        );

        return;
      }


      const apiUrl =
        import.meta.env
          .VITE_API_URL;


      const response =
        await fetch(
          `${apiUrl}/invoices/${saleId}/generate`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`
            }
          }
        );


      const data =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          data.message ||
          "No se pudo generar el comprobante"
        );
      }


      alert(
        `Comprobante generado correctamente.\n\nNúmero: ${data.factura.numero}`
      );


      /*
       * Recargamos para que el estado que viene
       * de MongoDB pase a FACTURADA.
       */
      window.location.reload();

    } catch (error) {
      console.error(
        "Error generando comprobante:",
        error
      );


      alert(
        error instanceof Error
          ? error.message
          : "No se pudo generar el comprobante"
      );
    }
  };


/*
 * ============================================================
 * DESCARGAR COMPROBANTE
 * ============================================================
 */

const descargarComprobante =
  async (
    saleId: string
  ) => {
    try {
      const token =
        localStorage.getItem(
          "token"
        );


      if (!token) {
        alert(
          "No se encontró el token de sesión."
        );

        return;
      }


      const apiUrl =
        import.meta.env
          .VITE_API_URL;


      const response =
        await fetch(
          `${apiUrl}/invoices/${saleId}/pdf`,
          {
            method:
              "GET",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


      if (
        !response.ok
      ) {
        let mensaje =
          "No se pudo descargar el comprobante";


        try {
          const data =
            await response.json();

          mensaje =
            data.message ||
            mensaje;

        } catch {
          // La respuesta no era JSON.
        }


        throw new Error(
          mensaje
        );
      }


      /*
       * Convertimos la respuesta en archivo.
       */
      const blob =
        await response.blob();


      const url =
        window.URL
          .createObjectURL(
            blob
          );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        `comprobante-${saleId}.pdf`;


      document.body
        .appendChild(
          link
        );


      link.click();


      link.remove();


      window.URL
        .revokeObjectURL(
          url
        );

    } catch (error) {
      console.error(
        "Error descargando comprobante:",
        error
      );


      alert(
        error instanceof Error
          ? error.message
          : "No se pudo descargar el comprobante"
      );
    }
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 overflow-y-auto max-h-[75vh]">

      {/* ======================================================
          ENCABEZADO Y FILTROS
         ====================================================== */}

      <div className="flex flex-col gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">

        {/* Título y contador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Órdenes de Venta
            </h2>

            <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
              {filteredSales.length}{" "}
              {filteredSales.length === 1
                ? "orden"
                : "órdenes"}
            </span>

          </div>
        </div>

        {/* Barra de filtros */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">

          {/* Buscar cliente */}
          <div className="relative flex-1 min-w-[200px]">

            <MagnifyingGlassIcon className="h-4 w-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs font-medium shadow-xs transition-all placeholder:text-slate-400"
            />

          </div>

          {/* Rango de fechas */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">

            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 pr-1.5 border-r border-slate-200 dark:border-slate-800">

              <Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />

              <span>
                Fechas (DD/MM/YYYY)
              </span>

            </div>

            <div className="flex items-center gap-1.5">

              {/* Desde */}
              <div className="flex items-center gap-1">

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Desde
                </span>

                <input
                  type="date"
                  lang="es-AR"
                  value={dateFrom}
                  onChange={(e) =>
                    setDateFrom(
                      e.target.value
                    )
                  }
                  className="px-2 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900"
                  aria-label="Fecha desde en formato DD/MM/YYYY"
                />

              </div>

              <span className="text-slate-300 dark:text-slate-600 text-xs font-bold">
                –
              </span>

              {/* Hasta */}
              <div className="flex items-center gap-1">

                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Hasta
                </span>

                <input
                  type="date"
                  lang="es-AR"
                  value={dateTo}
                  onChange={(e) =>
                    setDateTo(
                      e.target.value
                    )
                  }
                  className="px-2 py-1 text-xs font-medium border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all hover:bg-white dark:hover:bg-slate-900"
                  aria-label="Fecha hasta en formato DD/MM/YYYY"
                />

              </div>

              {/* Limpiar fechas */}
              {(dateFrom ||
                dateTo) && (

                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                  className="p-1 ml-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Limpiar rango de fechas"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

              )}

            </div>
          </div>

          {/* Estado */}
          <div className="relative min-w-[140px]">

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs cursor-pointer transition-all hover:border-slate-300 dark:hover:border-slate-600"
            >
              <option value="TODOS">
                Todos los estados
              </option>

              <option value="CREADA">
                Creada
              </option>

              <option value="PAGADA">
                Pagada
              </option>

              <option value="FACTURADA">
                Facturada
              </option>

              <option value="CANCELADA">
                Cancelada
              </option>
            </select>

          </div>

        </div>
      </div>

      {/* ======================================================
          SIN RESULTADOS
         ====================================================== */}

      {filteredSales.length === 0 && (
        <p className="text-gray-500 dark:text-slate-400">
          No hay ventas que coincidan con la búsqueda.
        </p>
      )}

      {/* ======================================================
          LISTADO DE VENTAS
         ====================================================== */}

      <AnimatePresence>

        {paginatedSales.map(
          (sale) => (

            <motion.div
              key={sale._id}
              className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 mb-4 hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-800/30"
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              layout
            >

              {/* CABECERA DE LA ORDEN */}
              <div className="flex justify-between items-start sm:items-center">

                <div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      🔖 {sale.cliente}
                    </p>

                    {(() => {
                      const pm = getPaymentMethodBadge(sale.pago?.metodo);
                      return (
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border shadow-2xs ${pm.className}`}
                        >
                          <span>{pm.icon}</span>
                          <span>{pm.label}</span>
                        </span>
                      );
                    })()}
                  </div>

                  <p className="text-sm text-gray-400 dark:text-slate-500 mt-0.5">
                    Fecha:{" "}
                    {formatDateDDMMYYYY(
                      sale.fecha
                    )}
                  </p>

                </div>

                <div className="text-right">

                  {/* ==========================================
                      ACCIONES SEGÚN ESTADO
                     ========================================== */}

                  <div className="flex space-x-2 mt-3 justify-end">

                    {/* CREADA → Mercado Pago */}
                    {sale.estado === "CREADA" &&
                      (sale.pago?.metodo === "MERCADO_PAGO" ||
                        !sale.pago?.metodo) && (

                      <motion.button
                        onClick={() =>
                          pagarConMercadoPago(
                            sale._id
                          )
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-sky-500 hover:bg-sky-600 rounded-lg cursor-pointer transition-colors shadow-xs"
                        whileHover={{
                          scale: 1.05,
                        }}
                        whileTap={{
                          scale: 0.95,
                        }}
                        title="Pagar con Mercado Pago"
                      >

                        <CurrencyDollarIcon className="h-5 w-5" />

                        Mercado Pago

                      </motion.button>

                    )}

                    {/* PAGADA → Generar comprobante */}
{/* 
    PAGADA → generar comprobante y pasar a FACTURADA

    FACTURADA sin comprobante → generar comprobante histórico
*/}
{(
  sale.estado === "PAGADA" ||
  (
    sale.estado === "FACTURADA" &&
    !sale.factura
  )
) && (
  <motion.button
    onClick={() =>
      generarComprobante(
        sale._id
      )
    }
    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer transition-colors"
    whileHover={{
      scale: 1.05
    }}
    whileTap={{
      scale: 0.95
    }}
    title="Generar comprobante"
  >
    <CurrencyDollarIcon className="h-5 w-5" />

    Generar comprobante
  </motion.button>
)}


{/* FACTURADA → Descargar comprobante */}
{sale.estado ===
  "FACTURADA" &&
  sale.factura && (

  <motion.button
    onClick={() =>
      descargarComprobante(
        sale._id
      )
    }
    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer transition-colors"
    whileHover={{
      scale: 1.05
    }}
    whileTap={{
      scale: 0.95
    }}
    title="Descargar comprobante"
  >

    <CurrencyDollarIcon className="h-5 w-5" />

    Descargar comprobante

  </motion.button>

)}

                    {/* CREADA / PAGADA → cancelar */}
                    {(sale.estado ===
                      "CREADA" ||
                      sale.estado ===
                        "PAGADA") && (

                      <motion.button
                        onClick={() =>
                          onUpdateStatus(
                            sale._id,
                            "CANCELADA"
                          )
                        }
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 cursor-pointer p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        whileHover={{
                          scale: 1.15,
                        }}
                        whileTap={{
                          scale: 0.9,
                        }}
                        title="Cancelar venta"
                      >

                        <TrashIcon className="h-5 w-5" />

                      </motion.button>

                    )}

                  </div>

                  {/* ESTADO */}
                  <span
                    className={
                      "inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-full border " +
                      getStatusBadge(
                        sale.estado
                      )
                    }
                  >
                    {sale.estado}
                  </span>

                  {/* TOTAL */}
                  <p className="text-xl font-semibold text-green-600 dark:text-green-400 mt-2">
                    $
                    {sale.total.toLocaleString(
                      "es-AR"
                    )}
                  </p>

                </div>
              </div>

              {/* ==============================================
                  ITEMS DE LA VENTA
                 ============================================== */}

              <div className="mt-4">

                {sale.items.map(
                  (item, i) => (

                    <div
                      key={i}
                      className="flex justify-between text-gray-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 py-1.5 text-sm"
                    >

                      <span>
                        {item.nombre}
                      </span>

                      <span>
                        {item.cantidad}
                        {" x $"}

                        {item.precioUnitario.toLocaleString(
                          "es-AR"
                        )}

                        {" = $"}

                        {(
                          item.cantidad *
                          item.precioUnitario
                        ).toLocaleString(
                          "es-AR"
                        )}
                      </span>

                    </div>

                  )
                )}

              </div>

              {/* NOTAS */}
              {sale.notas && (

                <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">

                  <span className="font-semibold">
                    Notas:
                  </span>{" "}

                  {sale.notas}

                </div>

              )}

              {/* VENDEDOR */}
              {sale.vendedor && (

                <div className="mt-2 text-sm text-gray-500 dark:text-slate-400">

                  <span className="font-semibold">
                    Vendedor:
                  </span>{" "}

                  {sale.vendedor.nombre}

                </div>

              )}

            </motion.div>

          )
        )}

      </AnimatePresence>

      {/* ======================================================
          PAGINACIÓN
         ====================================================== */}

      {filteredSales.length > 0 && (

        <Pagination
          currentPage={currentPage}
          totalItems={
            filteredSales.length
          }
          pageSize={pageSize}
          onPageChange={
            setCurrentPage
          }
          onPageSizeChange={
            setPageSize
          }
        />

      )}

    </div>
  );
}
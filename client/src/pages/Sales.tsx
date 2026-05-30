"use client";
import { useEffect, useState } from "react";
import { ClockIcon, UserIcon } from "@heroicons/react/24/solid";
import { listProducts } from "../services/productsService";
import ProductStockList from "./Products/ListProducts";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { ShoppingCart, LayoutDashboard, PlusCircle, List as ListIcon, Package } from "lucide-react";
import SalesCharts from "../components/ui/SalesSummary/SalesCharts";
import { useSales } from "../features/sales/hooks/useSales";
import SalesForm from "../features/sales/components/SalesForm";
import SalesList from "../features/sales/components/SalesList";

export default function Sales() {
  const { sales, fetchSales, handleUpdateStatus, handleCreateSale } = useSales();
  const [products, setProducts] = useState<any[]>([]);
  const [refreshProducts, setRefreshProducts] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'new_sale' | 'history' | 'inventory'>('overview');

  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, [fetchSales, refreshProducts]);

  const fetchProducts = async () => {
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleSaleSubmit = async (saleData: any) => {
    const success = await handleCreateSale(saleData);
    if (success) {
      setRefreshProducts((prev) => !prev);
      setActiveTab('history'); // Redirigir al historial tras venta exitosa
    }
    return success;
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

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex flex-col gap-6 font-sans">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Ventas</h1>
          </div>
          <p className="text-slate-500 font-medium mt-2">
            Gestiona las órdenes, clientes y seguimiento de ingresos
          </p>
        </div>
      </motion.div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center space-x-1 border-b border-slate-200 bg-white p-1 rounded-t-xl shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Visión General
        </button>
        <button
          onClick={() => setActiveTab('new_sale')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'new_sale' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <PlusCircle className="w-4 h-4" />
          Nueva Venta
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <ListIcon className="w-4 h-4" />
          Historial de Órdenes
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
        >
          <Package className="w-4 h-4" />
          Consulta de Stock
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex flex-col gap-6"
          >
            {/* Resumen */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Ventas del Día</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {sales.filter(s => new Date(s.fecha).toDateString() === new Date().toDateString()).length}
                  </p>
                </div>
                <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                  <ClockIcon className="h-7 w-7" />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-1">Clientes Únicos (Mes)</p>
                  <p className="text-3xl font-bold text-slate-800">
                    {new Set(sales.map(s => s.cliente)).size}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                  <UserIcon className="h-7 w-7" />
                </div>
              </motion.div>
            </div> */}

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SalesCharts sales={sales as any} />
            </div>
          </motion.div>
        )}

        {/* TAB: NEW SALE */}
        {activeTab === 'new_sale' && (
          <motion.div
            key="new_sale"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <div className="lg:col-span-8 lg:col-start-3 flex flex-col h-full">
              <SalesForm products={products} onSubmit={handleSaleSubmit} />
            </div>
          </motion.div>
        )}

        {/* TAB: HISTORY */}
        {activeTab === 'history' && (
          <motion.div
            key="history"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 gap-6"
          >
            <SalesList sales={sales} onUpdateStatus={handleUpdateStatus} />
          </motion.div>
        )}

        {/* TAB: INVENTORY */}
        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 gap-6"
          >
            <ProductStockList refresh={refreshProducts} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, Sparkles, LayoutDashboard, PieChart, Package, Users, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import SalesSummaryCard from "../components/ui/SalesSummary/SalesSummary";
import ProductsSummaryCard from '../components/ui/ProductsSummary/ProductsSummary';
import ProductsStockList from '../components/ui/ProductsSummary/ProductsStockList';

import { listSales } from '../services/salesServices';
import { useEffect, useState } from 'react';
import { listProducts } from '../services/productsService';
import SalesCategory from '../components/ui/SalesSummary/SalesCategory';
import { listReports } from '../services/reportService';
import { ExpensesSummaryCard } from '../components/ui/ExpensesSummary/ExpensesSummaryCard';


/*Datos para elaborar el grafico temporal*/
const monthlyRevenue = [
    { month: 'Ene', revenue: 180000, sales: 250 },
    { month: 'Feb', revenue: 220000, sales: 310 },
    { month: 'Mar', revenue: 195000, sales: 275 },
    { month: 'Abr', revenue: 255000, sales: 340 },
    { month: 'May', revenue: 290000, sales: 385 },
    { month: 'Jun', revenue: 315000, sales: 420 },
    { month: 'Jul', revenue: 280000, sales: 390 },
    { month: 'Ago', revenue: 330000, sales: 450 },
    { month: 'Sep', revenue: 360000, sales: 410 },
    { month: 'Oct', revenue: 400000, sales: 420 },
    { month: 'Nov', revenue: 450000, sales: 680 },
    { month: 'Dic', revenue: 500000, sales: 950 },
];

export default function Dashboard() {

    //Obtenemos los datos del usuario mas la fecha de hoy
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : { nombre: 'Invitado' };

    const today = new Date();
    const monthDescription = today.toLocaleString('default', { month: 'long' });
    const year = today.getFullYear();
    const day = today.getDate();
    const dayName = today.toLocaleString('es-ES', { weekday: 'long' });

    //Interfaces para ventas y productos
    interface Sale {
        fecha: string;
        total: number;
        categoria: string;
        items: {
            cantidad: number;
            product: {
                categoria: string;
            }
        }[];
    }

    interface Product {
        _id: string;
        nombre: string;
        stockDisponible: number;
        stockMinimo: number;
        categoria?: string;
    }


    // State para ventas y productos
    const [sales, setSales] = useState<Sale[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory'>('overview');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const expensesData = await listReports()
                setExpenses(expensesData)
            } catch (e) { console.error(e) }
        }

        const fetchSales = async () => {
            try {
                const salesData = await listSales();
                setSales(salesData);
            } catch (e) { console.error(e) }
        };
        const fetchProducts = async () => {
            try {
                const productsData = await listProducts()
                setProducts(productsData);
            } catch (e) { console.error(e) }
        }
        fetchExpenses();
        fetchSales();
        fetchProducts();
    }, []);

    const tabVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
    };

    return (

        <div className="p-4 sm:p-8 bg-slate-50 min-h-screen flex flex-col gap-6 font-sans">
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Gerencial</h1>
                    </div>
                    <p className="text-slate-500 font-medium mt-2">
                        Bienvenido, <span className="text-indigo-600 font-semibold">{userData.nombre}</span> — {dayName}, {day} de {monthDescription} de {year}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button 
                        onClick={() => window.location.href = '/reports'}
                        className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-sm font-semibold"
                    >
                        <FileText className="w-4 h-4" />
                        Reportes
                    </button>
                    <button 
                        onClick={() => window.location.href = '/users'}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm text-sm font-semibold"
                    >
                        <Users className="w-4 h-4" />
                        Usuarios
                    </button>
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
                    onClick={() => setActiveTab('sales')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'sales' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <PieChart className="w-4 h-4" />
                    Análisis de Ventas
                </button>
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${activeTab === 'inventory' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                >
                    <Package className="w-4 h-4" />
                    Inventario & Gastos
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
                        {/* GRID CARDS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SalesSummaryCard sales={sales} />
                            <ProductsSummaryCard products={products} />
                            <ExpensesSummaryCard expenses={expenses} />
                        </div>

                        {/* EVOLUCIÓN MENSUAL */}
                        <Card className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    Evolución Mensual de Facturación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[380px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis
                                                dataKey="month"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#64748b', fontSize: 12 }}
                                                tickFormatter={(value) => '$' + (value / 1000) + 'k'}
                                                dx={-10}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                                formatter={(value, name) => [
                                                    name === 'revenue' ? '$' + value.toLocaleString() : value,
                                                    name === 'revenue' ? 'Facturación' : 'Ventas'
                                                ]}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="revenue"
                                                stroke="#4f46e5"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorRevenue)"
                                                activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* TAB: SALES */}
                {activeTab === 'sales' && (
                    <motion.div
                        key="sales"
                        variants={tabVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="grid grid-cols-1 gap-6"
                    >
                         <SalesCategory sales={sales} />
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
                        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                    >
                        <ProductsStockList products={products} />
                        
                        {/* Placeholder for future inventory features */}
                        <Card className="bg-slate-50 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center p-8 text-center rounded-2xl shadow-none">
                            <Package className="w-12 h-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-medium text-slate-600 mb-2">Más herramientas de inventario próximamente</h3>
                            <p className="text-sm text-slate-500">Aquí se podrán agregar reportes detallados de gastos y reposición de stock.</p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, Sparkles, Users, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import SalesSummaryCard from "../components/ui/SalesSummary/SalesSummary";
import ProductsSummaryCard from '../components/ui/ProductsSummary/ProductsSummary';
import ProductsStockList from '../components/ui/ProductsSummary/ProductsStockList';

import { listSales } from '../services/salesServices';
import { useEffect, useMemo, useState } from 'react';
import { listProducts } from '../services/productsService';
import SalesCategory from '../components/ui/SalesSummary/SalesCategory';
import { listReports } from '../services/reportService';
import { ExpensesSummaryCard } from '../components/ui/ExpensesSummary/ExpensesSummaryCard';
import { useTheme } from '../context/ThemeContext';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function Dashboard() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const chartColors = {
        grid: isDark ? '#334155' : '#e2e8f0',
        axisText: isDark ? '#94a3b8' : '#64748b',
        tooltipBg: isDark ? '#1e293b' : '#ffffff',
        tooltipText: isDark ? '#e2e8f0' : '#1e293b',
    };

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

    const monthlyRevenue = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const totals = Array.from({ length: 12 }, () => ({ revenue: 0, sales: 0 }));

        sales.forEach((sale) => {
            const fecha = new Date(sale.fecha);
            if (fecha.getFullYear() !== currentYear) return;
            const monthIndex = fecha.getMonth();
            totals[monthIndex].revenue += Number(sale.total || 0);
            totals[monthIndex].sales += 1;
        });

        return MONTH_NAMES.map((month, i) => ({ month, ...totals[i] }));
    }, [sales]);

    return (

        <div className="p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col gap-6 font-sans">
            {/* HEADER */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Dashboard Gerencial</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
                        Bienvenido, <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{userData.nombre}</span> — {dayName}, {day} de {monthDescription} de {year}
                    </p>
                </div>

                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <button 
                        onClick={() => window.location.href = '/reports'}
                        className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-slate-50 hover:dark:bg-slate-950 transition-colors shadow-sm text-sm font-semibold"
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

            {/* VISIÓN GENERAL */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="flex flex-col gap-6"
            >
                {/* GRID CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SalesSummaryCard sales={sales} />
                    <ProductsSummaryCard products={products} />
                    <ExpensesSummaryCard expenses={expenses} />
                </div>

                {/* EVOLUCIÓN MENSUAL */}
                <Card className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100/50 dark:border-slate-700/50 pb-4">
                        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartColors.axisText, fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: chartColors.axisText, fontSize: 12 }}
                                        tickFormatter={(value) => '$' + (value / 1000) + 'k'}
                                        dx={-10}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: chartColors.tooltipBg, color: chartColors.tooltipText, borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
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

                {/* VENTAS POR CATEGORÍA + ALERTAS DE STOCK */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalesCategory sales={sales} />
                    <ProductsStockList products={products} />
                </div>
            </motion.div>
        </div>
    )
}

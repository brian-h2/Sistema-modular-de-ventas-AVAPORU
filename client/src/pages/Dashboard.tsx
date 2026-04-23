import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

import SalesSummaryCard from "../components/ui/SalesSummary/SalesSummary";
import ProductsSummaryCard from '../components/ui/ProductsSummary/ProductsSummary';
import ProductsStockList from '../components/ui/ProductsSummary/ProductsStockList';

import { listSales } from '../services/salesServices';
import { useEffect, useState } from 'react';
import { listProducts } from '../services/productsService';
import SalesCategory from '../components/ui/SalesSummary/SalesCategory';
import ManagerActions from '../components/ui/ManagerSummary/ManagerActions';
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

  useEffect(() => {
    const fetchExpenses = async () => {
        try {
            const expensesData = await listReports()
            setExpenses(expensesData)
        } catch(e) { console.error(e) }
    }

    const fetchSales = async () => {
        try {
            const salesData = await listSales();
            setSales(salesData);
        } catch(e) { console.error(e) }
    };
    const fetchProducts = async () => { 
        try {
            const productsData = await listProducts()
            setProducts(productsData);
        } catch(e) { console.error(e) }
    }
    fetchExpenses();
    fetchSales();
    fetchProducts();
  }, []);

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    
   <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen flex flex-col gap-8 font-sans">
        {/* HEADER */}
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-2"
        >
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl shadow-sm">
                    <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Gerencial</h1>
            </div>
            <h2 className="text-lg text-slate-500 font-medium mt-2">
                Bienvenido de nuevo, <span className="text-emerald-600 font-semibold">{userData.nombre}</span> — {dayName}, {day} de {monthDescription} de {year}
            </h2>
        </motion.div>

        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-8"
        >
            {/* GRID CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Ventas del día + ordenes procesadas */}
                <motion.div variants={itemVariants}>
                    <SalesSummaryCard sales={sales} />
                </motion.div>

                {/* Stock crítico */}
                <motion.div variants={itemVariants}>
                    <ProductsSummaryCard products={products} />
                </motion.div>

                {/* Gastos del día */}
                <motion.div variants={itemVariants}>
                    <ExpensesSummaryCard expenses={expenses} />
                </motion.div>
                
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className="lg:col-span-2 space-y-6">
                    <motion.div variants={itemVariants}>
                        <SalesCategory sales={sales}/>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-4">
                                <CardTitle className="flex items-center gap-2 text-slate-800">
                                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    Evolución Mensual de Facturación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="h-[350px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
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
                                        stroke="#10b981" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                        activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                                    />
                                    </AreaChart>
                                </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
                <div className="space-y-6">
                   <motion.div variants={itemVariants}>
                       <ProductsStockList products={products} />
                   </motion.div>
                   <motion.div variants={itemVariants}>
                       <ManagerActions />
                   </motion.div>
                </div>
            </div>
        </motion.div>
    </div>
  )
}

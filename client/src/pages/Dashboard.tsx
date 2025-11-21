import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp } from 'lucide-react';

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
    const userData = user ? JSON.parse(user) : null;

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
    // Simulamos la obtención de datos de ventas desde una API o base de datos

    const fetchExpenses = async () => {
        const expensesData = await listReports()
        setExpenses(expensesData)
    }

    const fetchSales = async () => {
        const salesData = await listSales();
        setSales(salesData);
    };
    const fetchProducts = async () => { 
        const productsData = await listProducts()
        setProducts(productsData);
    }
    fetchExpenses();
    fetchSales();
    fetchProducts();
  }, []);

  return (
    
   <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
        {/* HEADER */}
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-800">Dashboard Gerencial</h1>
            <h2 className="text-lg text-gray-600 mt-1">Bienvenido, {userData.nombre} - {dayName},  {day} de  {monthDescription} de {year}</h2>
        </div>

            {/* GRID CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                
                {/* Ventas del día + ordenes procesadas */}
                <SalesSummaryCard sales={sales} />

                {/* Stock crítico */}
                <ProductsSummaryCard products={products} />

                {/* Gastos del día */}
                <ExpensesSummaryCard expenses={expenses} />
            </div>
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                <div className="lg:col-span-2 space-y-6 ">
                    <SalesCategory sales={sales}/>
                      <Card className="bg-white rounded-xl shadow-md p-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#10b981]" />
                    Evolución Mensual de Facturación
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyRevenue}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip 
                            formatter={(value, name) => [
                            name === 'revenue' ? `$${value.toLocaleString()}` : value,
                            name === 'revenue' ? 'Facturación' : 'Ventas'
                            ]} 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={3}
                            dot={{ r: 6 }}
                        />
                        </LineChart>
                    </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
                </div>
                <div className="space-y-6">
                   <ProductsStockList products={products} />
                    <ManagerActions />
                </div>
            </div>
    </div>
  )
}

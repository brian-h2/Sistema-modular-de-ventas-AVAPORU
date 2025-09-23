import {  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,  LineChart, Line } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { TrendingUp } from 'lucide-react';


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


  return (
   <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
    {/* HEADER */}
    <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">Dashboard Gerencial</h1>
        <h2 className="text-lg text-gray-600 mt-1">Bienvenido al panel de control</h2>
    </div>

        {/* GRID CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Ventas del día */}
            <div className=" bg-gradient-to-r from-[#10b981] to-[#059669] rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
                <h1 className="text-lg font-semibold text-white mb-6">Ventas del día 💲</h1>
                <p className="text-2xl font-bold text-white">$15.660</p>
                <p className="text-sm text-white mt-1">Comparado con ayer: <span className="text-white font-medium">+5%</span></p>
            </div>

            {/* Órdenes procesadas */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
                <h1 className="text-lg font-semibold text-gray-700 mb-6">Órdenes procesadas 📈</h1>
                <p className="text-2xl font-bold text-blue-600">23</p>
                <p className="text-sm text-gray-500 mt-1">Comparado con ayer: <span className="text-blue-600 font-medium">+6%</span></p>
            </div>

            {/* Stock crítico */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
                <h1 className="text-lg font-semibold text-gray-700 mb-6">Stock crítico ⚠️</h1>
                <p className="text-2xl font-bold text-yellow-600">3</p>
                <p className="text-sm text-gray-500 mt-1">Productos en falta</p>
            </div>

            {/* Gastos del día */}
            <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
                <h1 className="text-lg font-semibold text-gray-700 mb-6">Gastos del día 📉</h1>
                <p className="text-2xl font-bold text-red-600">$300.000</p>
                <p className="text-sm text-gray-500 mt-1">Gastos registrados</p>
            </div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

            <Card className="col-span-2 bg-white rounded-xl shadow-md p-6">
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

            <Card className="col-span-1 bg-white rounded-xl shadow p-6 ">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Alertas de stock ⚠️
                    </CardTitle>
                </CardHeader>
                <CardContent className='px-6 [&amp;:last-child]:pb-6 space-y-3'>
                    <div className="flex items-center justify-between p-3 rounded-lg ">
                        <div className="flex-1">
                            <p className="font-medium text-sm">Nike Air Max 270</p>
                            <p className="text-xs text-gray-600">Deportivas</p>
                        </div>
                         <div className="text-center">
                            <p className="font-bold">3</p>
                            <span
                                data-slot="badge"
                                className="inline-flex items-center justify-center rounded-md border py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-primary/90 text-xs bg-red-100 text-red-800 border-red-300"
                                >Crítico
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg ">
                        <div className="flex-1">
                            <p className="font-medium text-sm">Adidas Superstar</p>
                            <p className="text-xs text-gray-600">Urbanas</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold">8</p>
                            <span
                                data-slot="badge"
                                className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-primary/90 text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                                >Bajo
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex-1">
                            <p className="font-medium text-sm">Cordones Premium</p>
                            <p className="text-xs text-gray-600">Accesorios</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold">15</p>
                            <span
                                data-slot="badge"
                                className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-primary/90 text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                                >Bajo
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg">
                        <div className="flex-1">
                            <p className="font-medium text-sm">Vans KNU Clasic</p>
                            <p className="text-xs text-gray-600">Urbanas</p>
                        </div>
                        <div className="text-center">
                            <p className="font-bold">9</p>
                            <span
                                data-slot="badge"
                                className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 font-medium w-fit whitespace-nowrap shrink-0 [&amp;&gt;svg]:size-3 gap-1 [&amp;&gt;svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden [a&amp;]:hover:bg-primary/90 text-xs bg-yellow-100 text-yellow-800 border-yellow-300"
                                >Bajo
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </div>
    
    </div>
  )
}

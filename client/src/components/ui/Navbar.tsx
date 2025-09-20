import { Link, useNavigate } from "react-router-dom";

export default function  () {

  const navigate = useNavigate();

  return (
    <nav className="bg-black text-white px-6 flex justify-between items-center h-16"> 
         <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-[#10b981]">Avaporu</h1>
      <div className="hidden md:flex gap-6">
         <button 
            onClick={() => navigate("/")} 
            className="px-3 py-2 rounded-md transition-colors bg-[#10b981] text-white cursor-pointer" 
        >
            Dashboard
        </button>
        <button 
            onClick={() => navigate("/Ventas")}
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
        >
            Ventas
        </button>
         {/* <button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
         > */}
            {/* Stock</button
         ><button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
         >
            Compras</button
         ><button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
         >
            Gastos</button
         ><button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
         >
            Reportes</button
         ><button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
         >
            Usuarios
         </button> */}
      </div>
   </div>
   <div className="flex items-center gap-4">
      <span className="text-sm">Pablo Cozzi (gerente) </span>
      <button
         className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
         Cerrar Sesión
      </button>
   </div>
    </nav>
  )
}

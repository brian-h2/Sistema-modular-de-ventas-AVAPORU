import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'

export default function  () {

  const navigate = useNavigate();

  const name = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || '{}').nombre : "Usuario";
  const rol = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || '{}').role : "Encargado";

  return (
    <nav className="bg-black text-white px-6 flex justify-between items-center h-16"> 
         <div className="flex items-center gap-4">
      <h1 className="text-2xl font-bold text-[#10b981]">Avaporu</h1>
      <div className="hidden md:flex gap-6">
         <button 
            onClick={() => navigate("/dashboard")} 
            className="px-3 py-2 rounded-md transition-colors bg-[#10b981] text-white cursor-pointer" 
        >
            Dashboard
        </button>
        <button 
            onClick={() => navigate("/sales")}
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
        >
            Ventas
        </button>
         <button
            className="px-3 py-2 rounded-md transition-colors hover:bg-gray-800 cursor-pointer"
            onClick={() => navigate("/stock")} 
         > Stock</button>
         {/* <button
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
      <span className="text-sm">{name + ' ' + '(' + rol + ')'} </span>
      <button
         onClick={() => {

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            Swal.fire({
                    text: "Sesion cerrada con exito",
                    icon: "success"
            });
            navigate("/login");
         }}
         className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors cursor-pointer"
      >
         Cerrar Sesión
      </button>
   </div>
    </nav>
  )
}

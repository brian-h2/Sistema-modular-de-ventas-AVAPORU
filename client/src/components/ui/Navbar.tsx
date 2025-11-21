import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Menu, X } from "lucide-react"; // íconos

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) =>
  location.pathname === path
    ? "bg-[#10b981] text-white cursor-pointer"
    : "hover:bg-gray-800 cursor-pointer";

  const [open, setOpen] = useState(false);

  const name = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").nombre
    : "Usuario";

  const rol = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").role
    : "Encargado";


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    Swal.fire({
      text: "Sesión cerrada con éxito",
      icon: "success",
    });

    navigate("/login");
  };

  return (
    <nav className="bg-black text-white px-6 flex items-center justify-between h-16 relative shadow">
      {/* Logo + Hamburguesa */}
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-[#10b981]">Avaporu</h1>

        {/* Hamburguesa (solo mobile) */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Menú Desktop */}
      <div className="hidden md:flex gap-6">
        <button
  onClick={() => navigate("/dashboard")}
  className={`px-3 py-2 rounded-md transition-colors ${isActive("/dashboard")}`}
>
  Dashboard
</button>


        <button
          onClick={() => navigate("/sales")}
          className={`px-3 py-2 rounded-md transition-colors ${isActive("/sales")}`}
        >
          Ventas
        </button>

        <button
          onClick={() => navigate("/stock")}
          className={`px-3 py-2 rounded-md transition-colors ${isActive("/stock")}`}
        >
          Stock
        </button>

        <button
          onClick={() => navigate("/users")}
          className={`px-3 py-2 rounded-md transition-colors ${isActive("/users")}`}
        >
          Usuarios
        </button>

        <button
          onClick={() => navigate("/expenses")}
          className={`px-3 py-2 rounded-md transition-colors ${isActive("/expenses")}`}
        >
          Gastos
        </button>

        <button
          onClick={() => navigate("/reports")}
          className={`px-3 py-2 rounded-md transition-colors ${isActive("/reports")}`}
        >
          Reportes
        </button>
      </div>

      {/* Usuario + logout (desktop) */}
      <div className="hidden md:flex items-center gap-4">
        <span className="text-sm">{`${name} (${rol})`}</span>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Menú Mobile (drawer) */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-black flex flex-col gap-4 py-6 px-6 z-50 md:hidden border-t border-gray-800 animate-fade-in">
          <button onClick={() => { navigate("/dashboard"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Dashboard</button>
          <button onClick={() => { navigate("/sales"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Ventas</button>
          <button onClick={() => { navigate("/stock"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Stock</button>
          <button onClick={() => { navigate("/users"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Usuarios</button>
          <button onClick={() => { navigate("/expenses"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Gastos</button>
          <button onClick={() => { navigate("/reports"); setOpen(false); }} className="py-2 text-left hover:text-[#10b981]">Reportes</button>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <span className="block text-sm mb-2">{`${name} (${rol})`}</span>

            <button
              onClick={() => { handleLogout(); setOpen(false); }}
              className="w-full bg-red-600 hover:bg-red-700 cursor-pointer py-2 rounded-md mt-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

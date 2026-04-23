import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Users, Receipt, BarChart3, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Ventas", path: "/sales", icon: ShoppingCart },
    { name: "Stock", path: "/stock", icon: Package },
    { name: "Usuarios", path: "/users", icon: Users },
    { name: "Gastos", path: "/expenses", icon: Receipt },
    { name: "Reportes", path: "/reports", icon: BarChart3 },
  ];

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-16 flex items-center justify-between shadow-sm">
      {/* Brand */}
      <motion.div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
          <Package className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Avaporu
        </h1>
      </motion.div>

      {/* Desktop Nav Links (Centered) */}
      <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all relative ${
              isActive(item.path)
                ? "text-[#10b981]"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
            {isActive(item.path) && (
              <motion.div
                layoutId="nav-active"
                className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#10b981] rounded-full"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* User Info (Desktop) */}
        <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 leading-none">{name}</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">{rol}</p>
          </div>
          <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 border border-slate-200">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 text-slate-600 hover:text-red-600 px-3 py-2 rounded-xl transition-colors"
          whileHover={{ x: 3 }}
        >
          <LogOut className="w-5 h-5" />
        </motion.button>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl lg:hidden z-40 overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-emerald-50 text-[#10b981]"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}
              
              <div className="mt-4 pt-4 border-t border-slate-100 px-3 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">{rol}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold transition-colors hover:bg-red-100"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

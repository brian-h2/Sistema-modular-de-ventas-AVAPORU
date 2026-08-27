import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import { Menu, X, LayoutDashboard, ShoppingCart, Package, Users, Receipt, BarChart3, LogOut, User, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const [open, setOpen] = useState(false);

  const name = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").nombre
    : "Usuario";

  const rol = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").role
    : "Encargado";

  const allNavItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Ventas", path: "/sales", icon: ShoppingCart },
    { name: "Stock", path: "/stock", icon: Package },
    { name: "Gastos", path: "/expenses", icon: Receipt },
    { name: "Reportes", path: "/reports", icon: BarChart3, hideFor: ["Vendedor"] },
    { name: "Usuarios", path: "/users", icon: Users, hideFor: ["Vendedor"] },
  ];

  const navItems = allNavItems.filter((item) => !item.hideFor?.includes(rol));


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
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 h-16 flex items-center justify-between shadow-sm">
      {/* Brand */}
      <motion.div 
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
        whileHover={{ scale: 1.02 }}
      >
        <div className="w-8 h-8 bg-[#10b981] rounded-lg flex items-center justify-center shadow-lg shadow-emerald-200">
          <Package className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
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
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
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
        <div className="hidden md:flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{name}</p>
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">{rol}</p>
          </div>
          <div className="w-9 h-9 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <User className="w-5 h-5" />
          </div>
        </div>

        {/* Theme Toggle (Desktop) */}
        <motion.button
          onClick={toggleTheme}
          className="hidden md:flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Cambiar tema"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>

        {/* Logout Button */}
        <motion.button
          onClick={handleLogout}
          className="hidden md:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 px-3 py-2 rounded-xl transition-colors"
          whileHover={{ x: 3 }}
        >
          <LogOut className="w-5 h-5" />
        </motion.button>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
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
            className="absolute top-16 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-xl lg:hidden z-40 overflow-hidden"
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
                      ? "bg-emerald-50 dark:bg-emerald-900/40 text-[#10b981]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </button>
              ))}

              <button
                onClick={toggleTheme}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-base font-medium transition-colors text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {theme === "dark" ? "Modo claro" : "Modo oscuro"}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 px-3 pb-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{rol}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold transition-colors hover:bg-red-100 dark:hover:bg-red-900/50"
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { loginUser } from '../../services/userService';
import { motion } from 'framer-motion';

export default function Login() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {

        const response = await loginUser({
          email: credentials.email,
          password: credentials.password
        });

        await new Promise (resolve => setTimeout(resolve, 800));

        Swal.fire({
            title: response?.message || "Inicio de sesión exitoso",
            text: response?.details || "Bienvenido de nuevo",
            icon: "success"
        });

        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));

        navigate('/dashboard');

    } catch (error: any) {

        Swal.fire({
            icon: "error",
            title:"Error en el inicio de sesion",
            text: error?.response?.data?.error || "Por favor, intenta nuevamente",
        });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Fondo patrón suave */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%2230%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      <motion.div 
        className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-8"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      >
        {/* Header */}
        <motion.div 
          className="text-center space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white text-2xl font-bold">A</span>
            </motion.div>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Avaporu</h1>
          <p className="text-gray-500 font-medium">Sistema de Gestión Integral</p>
        </motion.div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="text"
              placeholder="Ingrese su email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all outline-none"
              required
            />
          </motion.div>

          <motion.div 
            className="space-y-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full h-12 px-4 border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all outline-none"
              required
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 flex justify-center items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white cursor-pointer font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-70"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verificando...
              </div>
            ) : "Iniciar Sesión"}
          </motion.button>

          <motion.button
            type="button"
            className="w-full flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <a href="/register" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium">
              ¿No tienes una cuenta? Regístrate
            </a>
          </motion.button>
        </form>

        {/* Info demo */}
        <motion.div 
          className="mt-8 text-center text-sm text-gray-400 space-y-1 border-t border-slate-200 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="font-medium text-gray-500">Usuarios de prueba:</p>
          <p><strong className="text-gray-600">gerente@gmail.com</strong> / <strong className="text-gray-600">encargado@gmail.com</strong></p>
          <p>Contraseña: <strong className="text-gray-600">123456</strong></p>
        </motion.div>
      </motion.div>
    </div>
  );
}
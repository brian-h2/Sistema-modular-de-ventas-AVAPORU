import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { registrerUser } from '../../services/userService';
import { motion } from 'framer-motion';

export default function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        if (formData.password !== formData.confirmPassword) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Las contraseñas no coinciden",
            });
            setIsLoading(false);
            return;
        } 

        try {

            const response = await registrerUser({
                username: formData.username,
                email: formData.email,
                password: formData.password
            });

            await new Promise (resolve => setTimeout(resolve, 800));

            Swal.fire({
                title: response?.message || "Registro exitoso",
                text: response?.details || "Ahora puedes iniciar sesión",
                icon: "success"
            });

            navigate('/login');
            
        } catch (error: any) {
                Swal.fire({
                    icon: "error",
                    title: "Error en el registro",
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
                    className="absolute -top-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute -bottom-40 -right-40 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl"
                    animate={{ 
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <span className="text-white text-2xl font-bold">A</span>
                        </motion.div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Avaporu</h1>
                </motion.div>

                <motion.h2 
                    className="text-gray-500 text-center font-medium mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                >
                    Registro de Usuario
                </motion.h2>

                <form onSubmit={handleRegister} className="mt-6 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder='Ingrese su nombre'
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder='Ingrese su contraseña'
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder='Ingrese su contraseña nuevamente'
                            required
                        />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.45 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50 transition-all"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder='Ingrese su email'
                            required
                        />
                    </motion.div>

                    <motion.button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-emerald-500/25 flex items-center justify-center disabled:opacity-70"
                        disabled={isLoading}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Registrando...
                            </div>
                        ) : 'Registrarse'}
                    </motion.button>

                    <motion.button
                        type="button"
                        className="w-full flex justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <a href="/login" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium">
                            ¿Ya tienes una cuenta? Inicia sesión
                        </a>
                    </motion.button>
                </form>
            </motion.div>
        </div>
    )


}
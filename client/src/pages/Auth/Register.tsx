import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { registrerUser } from '../../services/userService';

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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            {/* Fondo patrón suave */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%2230%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            <div className="w-full max-w-md relative z-10 bg-white/95 backdrop-blur-sm rounded-lg shadow border border-gray-300 p-6">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">A</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Avaporu</h1>
                </div>
                <h2 className="text-gray-600 text-center">Registro de Usuario</h2>
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder='Ingrese su nombre'
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder='Ingrese su contraseña'
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder='Ingrese su contraseña nuevamente'
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder='Ingrese su email'
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Registrando...' : 'Registrarse'}
                    </button>

                    <button
                        type="button"
                        className="w-full flex justify-center"
                    >
                        <a href="/login" className="text-sm text-gray-600 hover:text-gray-800">
                            ¿Ya tienes una cuenta? Inicia sesión
                        </a>
                    </button>
                </form>
            </div>
        </div>
    )


}
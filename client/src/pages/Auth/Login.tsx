import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'
import { loginUser } from '../../services/userService';

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
          <p className="text-gray-600">Sistema de Gestión Integral</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="text"
              placeholder="Ingrese su email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="w-full h-12 px-3 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingrese su contraseña"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full h-12 px-3 border rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 flex justify-center items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer font-semibold rounded-md shadow"
          >
            {isLoading ? "Verificando..." : "Iniciar Sesión"}
          </button>

          <button
            type="button"
            className="w-full flex justify-center"
          >
            <a href="/register" className="text-sm text-gray-600 hover:text-gray-800">
              ¿No tienes una cuenta? Regístrate
            </a>
          </button>
        </form>

        {/* Info demo */}
        <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
          <p>Usuarios de prueba:</p>
          <p><strong>gerente@gmail.com</strong> / <strong>encargado@gmail.com</strong></p>
          <p>Contraseña: <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );
}
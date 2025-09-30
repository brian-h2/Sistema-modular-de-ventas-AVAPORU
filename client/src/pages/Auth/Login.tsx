import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'

// Usuarios de ejemplo para la demo
const mockUsers = [
  {
    id: '1',
    username: 'gerente',
    role: 'gerente',
    name: 'María González'
  },
  {
    id: '2',
    username: 'encargado',
    role: 'encargado',
    name: 'Carlos Pérez'
  }
];

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Simular verificación con delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = mockUsers.find(u => u.username === credentials.username);

    if (!user || credentials.password !== '123456') {
      Swal.fire({
            icon: "error",
            title: "Error",
            text: "Usuario o contraseña incorrecta",
        });
      setIsLoading(false);
      return;
    }

    Swal.fire({
        title: "Bienvenido, " + user.name,
        text: "Sesion iniciada con exito",
        icon: "success"
        });
    navigate('/dashboard');
    setIsLoading(false);
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
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              placeholder="Ingrese su usuario"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
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
        </form>

        {/* Info demo */}
        <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
          <p>Usuarios de prueba:</p>
          <p><strong>gerente</strong> / <strong>encargado</strong></p>
          <p>Contraseña: <strong>123456</strong></p>
        </div>
      </div>
    </div>
  );
}
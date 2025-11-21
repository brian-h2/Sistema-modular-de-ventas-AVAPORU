import { useState,useEffect } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/Card";
import {
  Plus, Users, Shield, CheckCircle, Key
} from "lucide-react";
import { listUsers, registerUserAdmin } from "../services/userService";
import Swal from "sweetalert2";


export default function UserManagement() {
  const [userFilter, setUserFilter] = useState("all");
  const [systemUsers, setSystemUsers] = useState<SystemUsers[]>([]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Encargado"
  });


  interface SystemUsers {
    id: string;
    nombre: string;
    username: string;
    email: string;
    status: string;
    lastLogin: string;
    permissions: string[];
    role: string;
  }

  const user = localStorage.getItem("user");
  const userData = user ? JSON.parse(user) : null;

   const fetchUsers = async () => {
      const systemUsers = await listUsers(userData?.token);
      setSystemUsers(systemUsers);
    };

  useEffect(() => {
   
 
    fetchUsers();
  }, []); 
  

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex flex-col gap-9">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">
            Administración de usuarios, roles y permisos del sistema
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </button>
      </div>

      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">

            <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Usuario</h2>
            <p className="text-gray-600 mb-6">Complete los campos para crear un nuevo usuario del sistema.</p>

            <div className="grid grid-cols-2 gap-4">

              {/* USERNAME */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usuario *</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-gray-50"
                  placeholder="Usuario"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-gray-50"
                  placeholder="email@empresa.com"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-gray-50"
                  placeholder="•••••••"
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-gray-50"
                  placeholder="•••••••"
                />
              </div>

              {/* ROLE */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border rounded-lg p-2 bg-gray-50"
                >
                  <option value="Encargado">Encargado</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Vendedor">Vendedor</option>
                </select>
              </div>

            </div>

            {/* BOTONES */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="flex-1 border border-gray-300 rounded-lg p-2 hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={async () => {
                  if (formData.password !== formData.confirmPassword) {
                    alert("Las contraseñas no coinciden");
                    return;
                  }

                  try {
                    await registerUserAdmin({
                      username: formData.username,
                      email: formData.email,
                      password: formData.password,
                      role: formData.role
                    });
                    Swal.fire({
                            icon: 'success',
                            title: 'Usuario creado', 
                            text: 'El usuario ha sido creado exitosamente.'
                          });
                    fetchUsers();
                    setIsCreateOpen(false);

                  } catch (err) {
                    console.error(err);
                    Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error al crear el usuario'
                          });
                  }
                }}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg"
              >
                Crear Usuario
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white shadow rounded-lg p-4 flex items-start space-x-3">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Total Usuarios</p>
              <p className="text-2xl font-bold">{systemUsers.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-white shadow rounded-lg p-4 flex items-start space-x-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
                            <p className="text-sm text-gray-600">Activos</p>

              <p className="text-2xl font-bold text-green-600">
                {systemUsers.filter((u) => u.status === "active").length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtro */}
      <Card className="bg-white rounded-lg shadow">
        <CardContent className="pb-0 pt-6">
          <div className="flex items-center gap-4">
            <Users className="w-5 h-5 text-green-500" />
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="bg-white shadow-md rounded-lg p-6 flex flex-col overflow-y-auto max-h-[75vh]">
        <CardTitle className="text-xl font-semibold mb-4 flex items-center space-x-2">Lista de Usuarios 👤</CardTitle>

          <div className="space-y-4">
            {systemUsers.map((u) => (
              <div
                key={u.id}
                className="border border-gray-300 rounded-lg p-4"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* LEFT: Avatar + datos */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-semibold">
                      {u.nombre
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-lg">{u.nombre}</h3>

                      {/* Username + correo */}
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        @{u.username} · {u.email}
                      </p>

                    </div>
                  </div>

                  {/* RIGHT: Badges + acciones */}
                  <div className="flex flex-col items-end gap-2">
                    {/* Badges */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Activo
                      </span>

                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full flex items-center gap-1">
                        <Shield className="w-3 h-3" /> {u.role}
                      </span>
                    </div>

                    {/* Botones */}
                    <div className="flex gap-2 mt-1">
    
                      <button className="border p-2 rounded hover:bg-gray-100">
                        <Key className="w-4 h-4" />
                      </button>
                      <button className="border p-2 rounded hover:bg-gray-100">
                        <Shield className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Permisos */}
                <div className="mt-4">
                    <p className="font-medium text-sm">Permisos:</p>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {[
                        "Crear Ventas",
                        "Ver Ventas",
                        "Procesar Devoluciones",
                        "Ver Stock",
                        "Actualizar Stock",
                        "Gestionar Productos"
                      ].map((permiso) => (
                        <span
                          key={permiso}
                          className="bg-gray-100 border rounded-full px-3 py-1 text-gray-700"
                        >
                          {permiso}
                        </span>
                      ))}

                      {/* Botón "+9 más" como en la imagen */}
                      <button className="text-blue-600 text-xs hover:underline">
                        +9 más
                      </button>
                    </div>
                  </div>
              </div>
            ))}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}

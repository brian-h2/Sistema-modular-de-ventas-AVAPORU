import { useState,useEffect } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/Card";
import {
  Plus, Users, Shield, CheckCircle, Key, Edit3, Calendar, Phone
} from "lucide-react";
import { listUsers } from "../services/userService";


export default function UserManagement() {
  const [userFilter, setUserFilter] = useState("all");
  const [systemUsers, setSystemUsers] = useState<SystemUsers[]>([]);

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

  useEffect(() => {
    const fetchUsers = async () => {
      const systemUsers = await listUsers(userData?.token);
      setSystemUsers(systemUsers);
    };

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

        <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </button>
      </div>

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

                      {/* Teléfono */}
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        123-456-7890
                      </p>

                      {/* Último acceso + MFA */}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Último acceso:{" "}
                        {new Date(u.lastLogin).toLocaleDateString("es-ES")}
                        <span className="ml-2 px-2 py-0.5 text-green-700 bg-green-100 rounded-full text-[10px]">
                          MFA: Habilitado
                        </span>
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
                        <Edit3 className="w-4 h-4" />
                      </button>
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

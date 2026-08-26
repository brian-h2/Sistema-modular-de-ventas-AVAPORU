import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "../components/ui/Card";
import {
  Plus, Users, Shield, CheckCircle, UserCog, Edit, Trash2, UserX, UserCheck
} from "lucide-react";
import { listUsers, registerUserAdmin, updateUser, deleteUser } from "../services/userService";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import Pagination from "../components/ui/Pagination";


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
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);


  interface SystemUsers {
    _id?: string;
    id: string;
    nombre: string;
    username: string;
    email: string;
    status: string;
    lastLogin: string;
    permissions: string[];
    role: string;
  }

  const token = localStorage.getItem("token");

   const fetchUsers = async () => {
      const systemUsers = await listUsers(token);
      setSystemUsers(systemUsers);
    };

  useEffect(() => {
   
 
    fetchUsers();
  }, []); 

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await updateUser(user._id || user.id, { status: newStatus }, token);
      Swal.fire({ icon: 'success', title: 'Estado actualizado', text: `Usuario ${newStatus === 'active' ? 'activado' : 'desactivado'}` });
      fetchUsers();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado' });
    }
  };

  const handleDelete = async (userId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await deleteUser(userId, token);
        Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success');
        fetchUsers();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
      }
    }
  };
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const filteredUsers = systemUsers.filter(
    (u) => userFilter === "all" || u.status === userFilter
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [userFilter, pageSize]);

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="p-4 sm:p-8 bg-gradient-to-br from-slate-50 dark:from-slate-900 to-slate-100 dark:to-slate-800 min-h-screen flex flex-col gap-8 font-sans">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
              <UserCog className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Gestión de Usuarios</h1>
          </div>
          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">
            Administración de usuarios, roles y permisos del sistema
          </p>
        </div>

        <motion.button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center bg-emerald-500 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-600 font-semibold shadow-sm transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
        </motion.button>
      </motion.div>

      <AnimatePresence>
        {isCreateOpen && (
          <motion.div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >

              <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100">{isEditing ? "Editar Usuario" : "Crear Nuevo Usuario"}</h2>
              <p className="text-gray-600 dark:text-slate-400 mb-6">{isEditing ? "Modifica los datos del usuario." : "Complete los campos para crear un nuevo usuario del sistema."}</p>

              <div className="grid grid-cols-2 gap-4">

                {/* USERNAME */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Usuario *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    placeholder="Usuario"
                  />
                </div>

                {/* EMAIL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    placeholder="email@empresa.com"
                  />
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    {isEditing ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    placeholder="•••••••"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Confirmar Contraseña *</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                    placeholder="•••••••"
                  />
                </div>

                {/* ROLE */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Rol *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 bg-slate-50/50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
                  >
                    <option value="Encargado">Encargado</option>
                    <option value="Gerente">Gerente</option>
                    <option value="Vendedor">Vendedor</option>
                  </select>
                </div>

              </div>

              {/* BOTONES */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={() => {
                    setIsCreateOpen(false);
                    setIsEditing(false);
                    setSelectedUserId(null);
                    setFormData({ nombre: "", username: "", email: "", password: "", confirmPassword: "", role: "Encargado" });
                  }}
                  className="flex-1 border border-slate-300 dark:border-slate-600 rounded-xl p-2.5 hover:bg-slate-50 hover:dark:bg-slate-950 transition-colors font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </motion.button>

                <motion.button
                  onClick={async () => {
                    if (formData.password && formData.password !== formData.confirmPassword) {
                      Swal.fire({ icon: 'warning', title: 'Error', text: 'Las contraseñas no coinciden' });
                      return;
                    }

                    try {
                      if (isEditing && selectedUserId) {
                        const updateData: any = {
                          nombre: formData.username,
                          email: formData.email,
                          role: formData.role
                        };
                        if (formData.password) updateData.password = formData.password;
                        
                        await updateUser(selectedUserId, updateData, token);
                        Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Usuario actualizado correctamente' });
                      } else {
                        await registerUserAdmin({
                          username: formData.username,
                          email: formData.email,
                          password: formData.password,
                          role: formData.role
                        }, token);
                        Swal.fire({
                                icon: 'success',
                                title: 'Usuario creado', 
                                text: 'El usuario ha sido creado exitosamente.'
                              });
                      }
                      fetchUsers();
                      setIsCreateOpen(false);
                      setIsEditing(false);
                      setSelectedUserId(null);

                    } catch (err: any) {
                      console.error(err);
                      const errorMsg = err?.response?.data?.error || (isEditing ? 'Error al actualizar el usuario' : 'Error al crear el usuario');
                      Swal.fire({
                              icon: 'error',
                              title: 'Error',
                              text: errorMsg
                            });
                    }
                  }}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-colors font-medium shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isEditing ? "Guardar Cambios" : "Crear Usuario"}
                </motion.button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Stats */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 p-5 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                <Users className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{systemUsers.length}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-slate-100 dark:border-slate-700 p-5 transition-all hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <CheckCircle className="w-7 h-7 text-green-500 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Activos</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {systemUsers.filter((u) => u.status === "active").length}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl border border-slate-100 dark:border-slate-700">
          <CardContent className="p-6 flex flex-col overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <CardTitle className="text-xl font-semibold flex items-center space-x-2 text-slate-900 dark:text-slate-100">Lista de Usuarios 👤</CardTitle>
            <select
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50/50 dark:bg-slate-800/50 transition-colors text-sm"
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>

            <div className="space-y-4">
                {paginatedUsers.map((u) => {
                    const userId = u._id || u.id;
                    return (
                      <div
                        key={userId}
                        className={"border rounded-xl p-4 transition-all " + (u.status === 'inactive' ? 'bg-slate-200 dark:bg-slate-700 opacity-60 border-slate-300 dark:border-slate-600' : 'border-slate-200 dark:border-slate-700 hover:shadow-md bg-slate-50/30 dark:bg-slate-800/30')}
                      >
                    <div className="flex justify-between items-start gap-4">
                      {/* LEFT: Avatar + datos */}
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <motion.div
                          className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-full flex items-center justify-center text-lg font-semibold shadow-sm"
                          whileHover={{ scale: 1.1 }}
                        >
                          {(u.nombre || "Usuario")
                            .split(" ")
                            .map((n) => n[0] || "")
                            .join("")
                            .slice(0, 2)}
                        </motion.div>

                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">{u.nombre}</h3>

                          {/* Username + correo */}
                          <p className="text-sm text-gray-600 dark:text-slate-400 flex items-center gap-1">
                            @{u.username} · {u.email}
                          </p>

                        </div>
                      </div>

                      {/* RIGHT: Badges + acciones */}
                      <div className="flex flex-col items-end gap-2">
                        {/* Badges */}
                        <div className="flex items-center gap-2">
                          <span className={"px-2.5 py-1 text-xs rounded-full flex items-center gap-1 font-medium " + (u.status === 'active' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-slate-300 text-slate-700 dark:text-slate-300')}>
                            {u.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <UserX className="w-3 h-3" />} {u.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>

                          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs rounded-full flex items-center gap-1 font-medium">
                            <Shield className="w-3 h-3" /> {u.role}
                          </span>
                        </div>

                         {/* Botones */}
                        <div className="flex gap-2 mt-1">
    
                          <motion.button 
                            onClick={() => {
                              const userToEdit = { ...u, username: u.username || u.nombre };
                              setFormData({
                                nombre: userToEdit.nombre,
                                username: userToEdit.username,
                                email: userToEdit.email,
                                password: "",
                                confirmPassword: "",
                                role: userToEdit.role
                              });
                              setSelectedUserId(userId);
                              setIsEditing(true);
                              setIsCreateOpen(true);
                            }}
                            className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors text-blue-600 dark:text-blue-400"
                            title="Editar usuario"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button 
                            onClick={() => handleToggleStatus(u)}
                            className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                            title={u.status === 'active' ? 'Desactivar usuario' : 'Activar usuario'}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </motion.button>
                          <motion.button 
                            onClick={() => handleDelete(userId)}
                            className="border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:bg-slate-100 hover:dark:bg-slate-800 transition-colors text-red-600 dark:text-red-400"
                            title="Eliminar usuario"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredUsers.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalItems={filteredUsers.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            )}

          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

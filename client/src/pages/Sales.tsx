"use client";
import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { listSales, createSale, updateSaleStatus} from "../services/salesServices";
import ProductStockList from "./Products/ListProducts";
import Swal from "sweetalert2";


export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [, setLoading] = useState(false);
  const [refreshProducts, setRefreshProducts] = useState(false);

  const [form, setForm] = useState({
    cliente: "",
    items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }],
  });

    useEffect(() => {
        fetchSales();
    }, []);

  const fetchSales = async () => {
    setLoading(true);
    try {     
        const data = await listSales();
        setSales(data);
    } catch (error) {
        console.error("Error fetching sales:", error);
    } finally {
        setLoading(false);
    }
};

//Metodo para actualizar el estado de una venta
const handleUpdateStatus = async (id: string, estado: Sale["estado"]) => {
  try {
    await updateSaleStatus(id, estado);
    await fetchSales();
    Swal.fire({
      icon: "success",
      title: "Estado actualizado",
      text: `La venta fue marcada como ${estado}`,
      timer: 1200,
      showConfirmButton: false,
    });
  } catch {
    Swal.fire({ icon: "error", title: "Error", text: "No se pudo actualizar el estado" });
  }
};

const handleAddItem = () => {
  setForm({ ...form, items: [...form.items, { nombre: "", cantidad: 1, precioUnitario: 0 }] });
};

interface Item {
    product: string;
    cantidad: number;
    precioUnitario: number;
    nombre: string;
}

interface Sale {
    _id: string;
    cliente: string;
    fecha: string;
    total: number;
    estado: "CREADA" | "PAGADA" | "FACTURADA" | "CANCELADA";
    items: Item[];
    notas: string;
}

const handleRemoveItem = (index: number) => {
    const copy = [...form.items];
    copy.splice(index, 1);
    setForm({ ...form, items: copy });
};

  type ItemField = "nombre" | "cantidad" | "precioUnitario";

  const handleChangeItem = (index: number, field: ItemField, value: string | number) => {
    const copy = [...form.items];
    copy[index] = { ...copy[index], [field]: value };
    setForm({ ...form, items: copy });
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const total = form.items.reduce((sum, item) => sum + item.cantidad * item.precioUnitario, 0);

      const saleData = {
        productos: form.items.map(item => ({
          productId:  item.nombre, // Ajusta según tu backend
          quantity: item.cantidad,
          precioUnitario: item.precioUnitario
        })),
        total,
        fecha: new Date().toISOString(),
        cliente: form.cliente,
      };

      await createSale(saleData);
      
      // Recargar ventas después de crear
      await fetchSales();
      setRefreshProducts(!refreshProducts); // Refrescar lista de productos
      
      // Resetear formulario
      setForm({ cliente: "", items: [{ nombre: "", cantidad: 1, precioUnitario: 0 }] });
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      let msg ="Ocurrió un error al crear la venta.";
      Swal.fire({
        icon: "error",
        title: "Ups...",
        text: msg,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-2">Ventas y Clientes</h1>
      <p className="text-gray-600 mb-8">
        Gestión de las ventas realizadas y relaciones con clientes.
      </p>

      

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-3">
          <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
          <div>
            <h2 className="text-gray-500">Ventas Activas</h2>
            <p className="text-2xl font-semibold text-indigo-600">
              {sales.length}
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-3">
          <UserIcon className="h-6 w-6 text-blue-500" />
          <div>
            <h2 className="text-gray-500">Clientes</h2>
            <p className="text-2xl font-semibold text-blue-500">
              {new Set(sales.map((s) => s.cliente)).size} {/* Mapeamos los clientes y usamos Set para contar únicos */}
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-3">
          <CheckCircleIcon className="h-6 w-6 text-green-500" />
          <div>
            <h2 className="text-gray-500">Pagadas</h2>
            <p className="text-2xl font-semibold text-green-600">
              {sales.filter((s) => s.estado === "PAGADA" || s.estado === "FACTURADA").length}
            </p>
          </div>
        </div>
        <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-3">
          <ClockIcon className="h-6 w-6 text-yellow-500" />
          <div>
            <h2 className="text-gray-500">Pendientes</h2>
            <p className="text-2xl font-semibold text-yellow-600">
              {sales.filter((s) => s.estado === "CREADA").length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de productos */}

      <ProductStockList refresh={refreshProducts} />

      {/* --- Form para crear nueva venta --- */}
      {/* Contenedor principal (form + lista) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* --- Formulario Nueva Venta --- */}
        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col overflow-y-auto max-h-[75vh]">
          <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
            <PlusCircleIcon className="h-6 w-6 text-indigo-500" />
            <span>Registrar Nueva Venta</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                required
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-2">Productos / Items</h3>
              {form.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Nombre del producto"
                    value={item.nombre}
                    onChange={(e) => handleChangeItem(index, "nombre", e.target.value)}
                    className="col-span-6 border rounded px-3 py-2"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Cantidad"
                    value={item.cantidad}
                    onChange={(e) => handleChangeItem(index, "cantidad", parseInt(e.target.value))}
                    className="col-span-3 border rounded px-3 py-2"
                    min={1}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Precio unitario"
                    value={item.precioUnitario}
                    onChange={(e) => handleChangeItem(index, "precioUnitario", parseFloat(e.target.value))}
                    className="col-span-3 border rounded px-3 py-2"
                    min={0}
                    required
                  />
                  {form.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700 ml-2 cursor-pointer"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddItem}
                className="mt-2 text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                + Agregar Item
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors duration-200"
            >
              Crear Venta
            </button>
          </form>
        </div>

        {/* --- Lista de Ventas --- */}
        <div className="bg-white rounded-lg shadow p-6 overflow-y-auto max-h-[75vh]">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Órdenes de Venta</h2>
          {sales.length === 0 && <p className="text-gray-500">No hay ventas registradas aún.</p>}
          {sales.map((sale) => (
            <div key={sale._id} className="border rounded-lg p-4 mb-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">🔖 {sale.cliente}</p>
                  <p className="text-sm text-gray-400">{`Fecha: ${sale.fecha}`}</p>
                </div>
                <div className="text-right">
                  <div className="flex space-x-2 mt-3 justify-end">
                    <button onClick={() => handleUpdateStatus(sale._id, "PAGADA")} className="text-green-600 hover:text-green-800 cursor-pointer">
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleUpdateStatus(sale._id, "FACTURADA")} className="text-purple-600 hover:text-purple-800 cursor-pointer">
                      <CurrencyDollarIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleUpdateStatus(sale._id, "CANCELADA")} className="text-red-600 hover:text-red-800 cursor-pointer">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">{sale.estado}</p>
                  <p className="text-xl font-semibold text-green-600 mt-2">
                    ${sale.total.toLocaleString("es-AR")}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                {sale.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-gray-600 border-b py-1">
                    <span>{item.nombre}</span>
                    <span>{`${item.cantidad} x $${item.precioUnitario.toLocaleString("es-AR")} = $${(item.cantidad * item.precioUnitario).toLocaleString("es-AR")}`}</span>
                  </div>
                ))}
              </div>

              {sale.notas && (
                <div className="mt-2 text-sm text-gray-500">
                  <strong>Notas: </strong>
                  {sale.notas}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
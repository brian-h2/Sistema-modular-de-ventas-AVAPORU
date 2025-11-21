import API from "./Api";

// Obtener todos los reportes
export const listReports = async () => {
  const response = await API.get("/reportes");
  return response.data;
};

// Crear un nuevo reporte
export const createReport = async (data: {
  descripcion: string;
  fecha: string | Date;
  categoria: string;
}) => {
  const response = await API.post("/reportes", data);
  return response.data;
};

// Eliminar un reporte por ID
export const deleteReport = async (id: string) => {
  const response = await API.delete(`/reportes/${id}`);
  return response.data;
};

// Obtener reporte de ventas entre fechas
export const getSalesReport = async (start?: string, end?: string) => {
  const response = await API.get("/reportes/ventas", {
    params: { start, end },
  });
  return response.data;
};



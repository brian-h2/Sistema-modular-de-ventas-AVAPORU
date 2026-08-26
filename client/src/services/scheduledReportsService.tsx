import API from "./Api";

export interface ScheduledReport {
  _id: string;
  tipo: "Ventas" | "Gastos" | "Inventario";
  frecuencia: "Diario" | "Semanal" | "Mensual";
  email: string;
  activo: boolean;
  ultimoEnvio?: string;
  createdAt: string;
}

export const listScheduledReports = async (): Promise<ScheduledReport[]> => {
  const response = await API.get("/scheduled-reports");
  return response.data;
};

export const createScheduledReport = async (data: {
  tipo: string;
  frecuencia: string;
  email: string;
}) => {
  const response = await API.post("/scheduled-reports", data);
  return response.data;
};

export const toggleScheduledReport = async (id: string) => {
  const response = await API.patch(`/scheduled-reports/${id}/toggle`);
  return response.data;
};

export const sendScheduledReportNow = async (id: string) => {
  const response = await API.post(`/scheduled-reports/${id}/send-now`);
  return response.data;
};

export const deleteScheduledReport = async (id: string) => {
  const response = await API.delete(`/scheduled-reports/${id}`);
  return response.data;
};

import API from "./Api";

export const listReports = async () => {
    const response = await API.get("/expenses");
    return response.data;
}

export const createReport = async (expensesData: {date: Date  , categoria: string; description: string; monto: number; presupuestoDisponible: number }) => {
    const response = await API.post("/expenses", expensesData);
    return response.data;
}


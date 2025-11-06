import API from "./Api";

export const listSales = async () => {
  const response = await API.get("/sales");
  return response.data;
};

export const createSale = async (saleData: { productos: Array<{ productId: string; quantity: number }>; total: number; fecha: string; cliente: string }) => {
    const response = await API.post("/sales", saleData);
    return response.data;
}

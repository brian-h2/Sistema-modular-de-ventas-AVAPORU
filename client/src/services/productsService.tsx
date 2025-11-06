import API from "./Api";

export const listProducts = async () => {
    const response = await API.get("/products");
    return response.data;
}

export const updateProduct = async (id: string, productData: any) => {
    const response = await API.patch(`/products/${id}`, productData);
    return response.data;
}

export const createProduct = async (productData: {sku: string  , nombre: string; precio: number; stockDisponible: number; stockMinimo: number; categoria: string; imageUrl: string }) => {
    const response = await API.post("/products", productData);
    return response.data;
}

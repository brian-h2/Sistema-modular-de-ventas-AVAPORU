import API from "./Api";

export const registrerUser = async (userData: { username: string; email: string; password: string }) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
}

export const loginUser = async (userData: { email: string; password: string }) => {
    const response = await API.post("/auth/login", userData);
    return response.data;
}

export const getMe = async () => {
    const response = await API.get("/auth/me");
    return response.data;
}
import axios from "axios";
const API = axios.create({
    baseURL: "http://localhost:3000/api",
});
export const registerUser = async(
    name,
    email,
    password,
    confirmPassword
) => {
    const response = await API.post("/users/register",{
        name,
        email,
        password,
        confirmPassword,
    });
    return response.data;
};

export const loginUser = async (email, password) => {
    const response = await API.post("/users/login", {
        email,
        password
    });
    return response.data;
};
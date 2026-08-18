import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE_URL}/api`;

const API = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const registerUser = async (name, email, password, confirmPassword) => {
  try {
    const response = await API.post("/auth/register", {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  } catch (err) {
    try {
      const fallback = await axios.post(`${API_BASE_URL}/api/users/register`, {
        name,
        email,
        password,
        confirmPassword,
      });
      return fallback.data;
    } catch (e) {
      throw err;
    }
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await API.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    try {
      const fallback = await axios.post(`${API_BASE_URL}/api/users/login`, {
        email,
        password,
      });
      return fallback.data;
    } catch (e) {
      throw err;
    }
  }
};
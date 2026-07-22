import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.clear();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login";
        }
      }
    } else if (error.request) {
      console.error("[API Network Error]: Server did not respond:", error.message);
      error.message = "Unable to connect to the backend server. Please verify your connection.";
    }
    return Promise.reject(error);
  }
);

export default api;
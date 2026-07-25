import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api.docuswift.online",  // ← ubah ini
});

// otomatis nempelin access_token ke setiap request
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// otomatis refresh kalau dapat 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const res = await axios.post("https://api.docuswift.online/api/refresh-token", {  // ← ubah ini
          refresh_token: refreshToken,
        });

        const newAccessToken = res.data.access_token;
        sessionStorage.setItem("access_token", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        sessionStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
import axios from "axios";

// Use environment variable or fallback to localhost
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Create axios instance with defaults
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem("access", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.dispatchEvent(new Event("authChanged"));
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// ========================
// AUTH API
// ========================
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (data) => api.post("/auth/register/", data),
  me: () => api.get("/auth/me/"),
};

// ========================
// PREDICTION API
// ========================
export const predictionAPI = {
  predict: (formData) =>
    api.post("/predict/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ========================
// PATIENTS API
// ========================
export const patientsAPI = {
  create: (formData) =>
    api.post("/patients/create/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyPatients: () => api.get("/patients/my-patients/"),
  getPatientByUID: (uid) => api.get(`/patients/by-uid/${uid}/`),
  getPatientDetail: (id) => api.get(`/patients/patient/${id}/`),
  getDoctorRegistry: () => api.get("/patients/doctor-registry/"),
};

// ========================
// SCANS API
// ========================
export const scansAPI = {
  uploadScan: (formData) =>
    api.post("/patients/upload-scan/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getMyScans: () => api.get("/patients/my-scans/"),
  getAllScans: () => api.get("/patients/scans/"),
  downloadPDF: (scanId) =>
    api.get(`/patients/scan/${scanId}/pdf/`, { responseType: "blob" }),
  submitReview: (scanId, reviewData) =>
    api.post(`/patients/scan/${scanId}/review/`, reviewData),
};

// Legacy export for backward compatibility
export const predictTumor = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);
  return predictionAPI.predict(formData);
};

export default api;

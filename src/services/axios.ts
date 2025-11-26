import axios from "axios";

// In dev we proxy `/api` to the backend (see `vite.config.ts`).
// Using a relative base avoids CORS in development.
const api = axios.create({
  // baseURL: "/api",
  baseURL: import.meta.env.VITE_APP_BACKEND_ORIGIN,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

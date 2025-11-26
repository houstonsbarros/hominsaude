import api from "./axios";

export function socialLoginBackend() {
  let next = `${window.location.origin}/auth/callback`;
  // Se tiver dois // na variável de ambiente, remover o último /
  if (next.includes("//auth/callback")) {
    next = next.replace("//auth/callback", "/auth/callback");
  }

  const BACKEND_ORIGIN = import.meta.env.VITE_APP_BACKEND_ORIGIN;

  let url = `${BACKEND_ORIGIN}/auth/login?next=${encodeURIComponent(next)}`;

  if (url.includes("//auth/login")) {
    url = url.replace("//auth/login", "/auth/login");
  }

  window.location.href = url;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  name: string;
  password: string;
}

export async function fetchUserWithToken(token: string) {
  try {
    const res = await api.get("/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = res.data;
    if (data && data.user) {
      return { ...data.user, claims: data.claims ?? {} };
    }

    return data;
  } catch (error) {
    console.error("Error fetching user with token:", error);
    throw error;
  }
}

export const loginAuth = async (data: LoginPayload) => {
  // POST /account/login
  const response = await api.post("/account/login", data);
  return response.data;
};

export const registerAuth = async (data: RegisterPayload) => {
  // POST /account/register
  const response = await api.post("/account/register", data);
  return response.data;
};

export const verifyEmailToken = async (token: string) => {
  // Nota: Verifique se seu backend espera GET ou POST.
  // Geralmente tokens via URL são validados via POST para confirmar a alteração de estado.
  // Ajuste para api.get se for o caso.
  const response = await api.post(`/account/verify-email/${token}`);
  return response.data;
};

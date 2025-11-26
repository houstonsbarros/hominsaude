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

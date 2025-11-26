import api from "./axios";

function authHeaders() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function sendMessage(message: string, conversaId?: number | null) {
  const body = { message, conversa_id: conversaId ?? null };
  const res = await api.post("/ai/chat", body, { headers: authHeaders() });
  return res.data; // { response, conversa_id, origem_contexto }
}

export async function createConversation(titulo?: string) {
  const res = await api.post(
    "/ai/conversas",
    { titulo },
    { headers: authHeaders() }
  );
  return res.data;
}

export async function getConversations() {
  const res = await api.get("/ai/conversas", { headers: authHeaders() });
  return res.data.conversas;
}

export async function getConversationById(conversaId: number) {
  const res = await api.get(`/ai/conversas/${conversaId}`, {
    headers: authHeaders(),
  });
  return res.data;
}

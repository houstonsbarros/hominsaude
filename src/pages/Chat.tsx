import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { sendMessage } from "../services/chat";
import {
  Send,
  Menu,
  Plus,
  MessageSquare,
  MoreVertical,
  LogOut,
  Bot,
  User,
  X,
  Loader2,
  Trash2,
  Lock, // Adicionei o ícone de cadeado
} from "lucide-react";
import { useNavigate } from "react-router";

// ... (Mantenha as interfaces Message, Conversation e INITIAL_MOCK_HISTORY iguais) ...
// --- Tipos ---
interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  origem?: string | null;
}

interface Conversation {
  id: number | string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

const INITIAL_MOCK_HISTORY: Record<string | number, Message[]> = {
  // ... (seus dados mock aqui) ...
};

export default function ChatPage() {
  const navigate = useNavigate();
  // Assumindo que o useAuth possa retornar um isLoading.
  // Se não retornar, pode remover a lógica de loading.
  const { user, loginWithGoogle } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Estados ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatsHistory, setChatsHistory] =
    useState<Record<string | number, Message[]>>(INITIAL_MOCK_HISTORY);

  const [conversations, setConversations] = useState<Conversation[]>([
    // ... (seus dados mock de conversas) ...
  ]);

  const [activeConversationId, setActiveConversationId] = useState<
    number | string | null
  >(null);

  const [messages, setMessages] = useState<Message[]>([]);

  // --- Efeitos ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (activeConversationId === null) {
      setMessages([
        {
          id: "welcome",
          text: "Olá! Sou o Touch, seu assistente virtual do HOMIN+. Como posso te ajudar hoje?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } else {
      const loadedMessages = chatsHistory[activeConversationId] || [];
      setMessages(loadedMessages);
    }
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [activeConversationId, chatsHistory]);

  // --- Funções ---
  const handleNewChat = () => {
    setActiveConversationId(null);
    setIsSidebarOpen(false);
  };

  const handleSendMessage = async () => {
    setError(null);
    if (!inputMessage.trim()) return;

    // Redundante se tivermos o bloqueio de tela, mas bom manter por segurança
    if (!user) {
      await loginWithGoogle();
      return;
    }

    const text = inputMessage.trim();
    const tempId = `temp-msg-${Date.now()}`;

    const userMessage: Message = {
      id: tempId,
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setInputMessage("");
    setLoading(true);
    setMessages((prev) => [...prev, userMessage]);

    let currentConversationId = activeConversationId;

    if (!currentConversationId) {
      currentConversationId = `temp-chat-${Date.now()}`;
      const newConv: Conversation = {
        id: currentConversationId,
        title: text.slice(0, 30) + (text.length > 30 ? "..." : ""),
        lastMessage: text,
        timestamp: new Date(),
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(currentConversationId);

      setChatsHistory((prev) => ({
        ...prev,
        [currentConversationId as string]: [userMessage],
      }));
    } else {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === currentConversationId
            ? { ...c, lastMessage: text, timestamp: new Date() }
            : c
        )
      );

      setChatsHistory((prev) => ({
        ...prev,
        [currentConversationId as string | number]: [
          ...(prev[currentConversationId as string | number] || []),
          userMessage,
        ],
      }));
    }

    try {
      const conversationIdToSend =
        typeof currentConversationId === "number"
          ? currentConversationId
          : null;

      const res = await sendMessage(text, conversationIdToSend);

      const botMessage: Message = {
        id: `resp-${Date.now()}`,
        text: res.response ?? "Sem resposta do servidor.",
        sender: "bot",
        timestamp: new Date(),
        origem: res.origem_contexto ?? null,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (res.conversa_id && currentConversationId !== res.conversa_id) {
        const realId = res.conversa_id;
        setConversations((prev) =>
          prev.map((c) =>
            c.id === currentConversationId ? { ...c, id: realId } : c
          )
        );

        setChatsHistory((prev) => {
          const history = prev[currentConversationId as string] || [];
          const { [currentConversationId as string]: _, ...rest } = prev;
          return {
            ...rest,
            [realId]: [...history, botMessage],
          };
        });
        setActiveConversationId(realId);
      } else {
        setChatsHistory((prev) => ({
          ...prev,
          [currentConversationId as string | number]: [
            ...(prev[currentConversationId as string | number] || []),
            botMessage,
          ],
        }));
      }
    } catch (err: any) {
      console.error("Erro ao enviar:", err);
      setError(err?.response?.data?.detail ?? "Erro ao contatar servidor.");
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        text: "Desculpe, tive um problema para processar sua mensagem. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      if (currentConversationId) {
        setChatsHistory((prev) => ({
          ...prev,
          [currentConversationId as string | number]: [
            ...(prev[currentConversationId as string | number] || []),
            errorMessage,
          ],
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    id: number | string
  ) => {
    e.stopPropagation();
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
    setChatsHistory((prev) => {
      const newHistory = { ...prev };
      delete newHistory[id];
      return newHistory;
    });
  };

  // ----------------------------------------------------------------------
  // BLOQUEIO DE ACESSO: Se não houver usuário logado, retorna tela de Login
  // ----------------------------------------------------------------------
  if (!user) {
    return navigate("/login");
  }

  // --- Render do Chat (Apenas se logado) ---
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* ... (Todo o seu código de renderização do chat permanece igual aqui) ... */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside
        className={`
          fixed md:relative z-30 w-72 h-full bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* ... Conteúdo da Sidebar ... */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div
            className="flex items-center gap-2 text-white font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot size={20} />
            </div>
            HOMIN+ AI
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400"
          >
            <X size={24} />
          </button>
        </div>

        {/* Botão Nova Conversa */}
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium"
          >
            <Plus size={20} />
            Nova Conversa
          </button>
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
          <h4 className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Histórico
          </h4>
          {conversations.length === 0 && (
            <p className="px-4 text-sm text-slate-600 italic">
              Nenhuma conversa anterior.
            </p>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className={`
                    group flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors
                    ${
                      activeConversationId === conv.id
                        ? "bg-slate-800 text-white"
                        : "hover:bg-slate-800/50"
                    }
                `}
            >
              <MessageSquare size={18} className="shrink-0" />
              <div className="flex-1 truncate text-sm">
                <p className="truncate font-medium">{conv.title}</p>
                <p className="truncate text-xs text-slate-500">
                  {conv.lastMessage}
                </p>
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
            <img
              src={
                user.photoURL ||
                `https://ui-avatars.com/api/?name=${user.displayName}`
              }
              alt="User"
              className="w-9 h-9 rounded-full border border-slate-600"
            />
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user.displayName}
              </p>
              <p className="text-xs text-slate-500 truncate">Plano Gratuito</p>
            </div>
            <LogOut
              size={18}
              className="text-slate-500 group-hover:text-red-400"
              onClick={() => {
                /* Adicione sua lógica de logout aqui, ex: signOut() */
                window.location.reload(); // Fallback simples
              }}
            />
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col h-full w-full bg-white md:bg-slate-50 relative">
        {/* Header Mobile/Desktop */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between md:justify-end shrink-0 z-10">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div
                className={`
                        max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-sm text-sm md:text-base leading-relaxed
                        ${
                          msg.sender === "user"
                            ? "bg-blue-600 text-white rounded-tr-none"
                            : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                        }
                    `}
              >
                {msg.sender === "bot" && msg.origem && (
                  <span className="block mb-2 text-xs font-bold text-blue-600 uppercase tracking-wide bg-blue-50 w-fit px-2 py-0.5 rounded">
                    Fonte: {msg.origem}
                  </span>
                )}

                <p className="whitespace-pre-wrap">{msg.text}</p>

                <div
                  className={`text-[10px] mt-2 flex items-center gap-1 ${
                    msg.sender === "user"
                      ? "text-blue-100 justify-end"
                      : "text-slate-400"
                  }`}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              {msg.sender === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0 shadow-sm mt-1 overflow-hidden">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Me"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-slate-500" />
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span className="text-sm text-slate-500">
                  O Touch está digitando...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Área de Input */}
        <div className="p-4 bg-white md:bg-transparent md:p-6 shrink-0">
          <div className="max-w-4xl mx-auto relative">
            {error && (
              <div className="absolute -top-10 left-0 right-0 bg-red-100 text-red-600 text-xs px-4 py-2 rounded-lg text-center mb-2 animate-bounce">
                {error}
              </div>
            )}

            <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-slate-200 shadow-lg p-2 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Digite sua mensagem sobre saúde..."
                className="w-full max-h-32 py-2.5 px-3 bg-transparent border-none outline-none resize-none text-slate-700 placeholder:text-slate-400 custom-scrollbar"
                rows={1}
                style={{ height: "auto" }}
              />

              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || loading}
                className="mb-1 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 mt-2">
              O HOMIN+ AI pode cometer erros. Considere verificar informações
              importantes com um médico.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

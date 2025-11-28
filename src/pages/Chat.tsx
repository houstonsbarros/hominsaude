import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  type JSX,
} from "react";
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
} from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  getConversationById,
  getConversations,
  sendMessage,
  deleteConversation,
} from "../services/chat";

// ----------------------------------------------------------------------
// 1. UTILS: SIMPLE MARKDOWN RENDERER (Zero Dependencies)
// ----------------------------------------------------------------------

const parseInline = (text: string) => {
  // Regex para capturar negrito: **texto**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const SimpleMarkdown = ({ text }: { text: string }) => {
  const lines = text.split("\n");
  const elements: JSX.Element[] = [];

  let currentListItems: JSX.Element[] = [];
  let isOrderedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detectar itens de lista
    const isUnordered = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const isOrdered = /^\d+\.\s/.test(trimmed);
    const isListItem = isUnordered || isOrdered;

    if (isListItem) {
      // Se começou uma lista ordenada, marca a flag
      if (isOrdered) isOrderedList = true;

      const content = isUnordered
        ? trimmed.slice(2)
        : trimmed.replace(/^\d+\.\s/, "");

      currentListItems.push(<li key={`li-${i}`}>{parseInline(content)}</li>);
    } else {
      // Se não é item de lista, mas tínhamos uma lista acumulada, renderiza ela antes
      if (currentListItems.length > 0) {
        elements.push(
          isOrderedList ? (
            <ol key={`ol-${i}`} className="list-decimal pl-5 mb-2 space-y-1">
              {currentListItems}
            </ol>
          ) : (
            <ul key={`ul-${i}`} className="list-disc pl-5 mb-2 space-y-1">
              {currentListItems}
            </ul>
          )
        );
        currentListItems = [];
        isOrderedList = false;
      }

      // Renderiza parágrafo se não for linha vazia
      if (trimmed) {
        elements.push(
          <p key={`p-${i}`} className="mb-2 last:mb-0 min-h-[1em]">
            {parseInline(line)}
          </p>
        );
      }
    }
  }

  // Flush final da lista se o texto terminou em lista
  if (currentListItems.length > 0) {
    elements.push(
      isOrderedList ? (
        <ol key="ol-end" className="list-decimal pl-5 mb-2 space-y-1">
          {currentListItems}
        </ol>
      ) : (
        <ul key="ul-end" className="list-disc pl-5 mb-2 space-y-1">
          {currentListItems}
        </ul>
      )
    );
  }

  return (
    <div className="text-sm md:text-base leading-relaxed text-slate-700">
      {elements}
    </div>
  );
};

interface Message {
  id: string | number;
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

// --- Interfaces da API ---
interface APIConversationItem {
  id_conversa: number;
  titulo: string;
  data_inicio: string;
  data_ultima_msg: string;
}

interface APIHistoryItem {
  id_historico: number;
  mensagem_texto: string;
  tipo: string;
  origem_contexto?: string;
  data_hora: string;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { user, loginWithGoogle, logout } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Estados ---
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Loading states
  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<number | null>(null);

  // Dados
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<
    number | string | null
  >(null);
  const [messages, setMessages] = useState<Message[]>([]);

  // --- Helpers ---
  const mapApiTypeToSender = (tipo: string): "user" | "bot" => {
    const t = tipo.toLowerCase();
    return t === "user" || t === "human" ? "user" : "bot";
  };

  // --- Carregar Lista de Conversas ---
  const fetchConversationsList = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getConversations();
      console.log("Conversas recebidas da API:", data);
      const mappedConversations: Conversation[] = data.map(
        (c: APIConversationItem) => {
          // Usa data_ultima_msg se disponível, senão usa data_inicio como fallback
          const dateToUse = c.data_ultima_msg || c.data_inicio;
          const timestamp = new Date(dateToUse);
          
          return {
            id: c.id_conversa,
            title: c.titulo || "Nova Conversa",
            lastMessage: "", // Não usado mais na interface
            timestamp: timestamp,
          };
        }
      );

      mappedConversations.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );

      setConversations(mappedConversations);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    }
  }, [user?.uid]); // Só recria se o ID do usuário mudar, não o objeto inteiro

  // --- Efeitos ---

  // 1. Carregar conversas ao montar ou logar
  useEffect(() => {
    fetchConversationsList();
  }, [fetchConversationsList]);

  // 2. Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loadingSend]);

  // 3. Responsividade da Sidebar
  useEffect(() => {
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  }, [activeConversationId]);

  // 4. Carregar Histórico da Conversa Ativa
  useEffect(() => {
    const loadHistory = async () => {
      if (activeConversationId === null) {
        setMessages([
          {
            id: "welcome",
            text: "Olá! Sou o **Touch**, seu assistente virtual do HOMIN+. Como posso te ajudar hoje?",
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
        return;
      }

      if (
        typeof activeConversationId === "string" &&
        activeConversationId.startsWith("temp-")
      ) {
        return;
      }

      setLoadingHistory(true);
      try {
        // Ensure we only call the API with a numeric id.
        // If activeConversationId is a numeric string, coerce it to number.
        if (typeof activeConversationId !== "number") {
          if (
            typeof activeConversationId === "string" &&
            /^\d+$/.test(activeConversationId)
          ) {
            const idNum = Number(activeConversationId);
            const data = await getConversationById(idNum);

            const mappedMessages: Message[] = data.historico.map(
              (h: APIHistoryItem) => ({
                id: h.id_historico,
                text: h.mensagem_texto,
                sender: mapApiTypeToSender(h.tipo),
                timestamp: new Date(h.data_hora),
                origem: h.origem_contexto,
              })
            );

            setMessages(mappedMessages);
            return;
          }

          // For non-numeric ids (e.g. temporary local conversations), nothing to load
          setMessages([]);
          return;
        }

        const data = await getConversationById(activeConversationId);

        const mappedMessages: Message[] = data.historico.map(
          (h: APIHistoryItem) => ({
            id: h.id_historico,
            text: h.mensagem_texto,
            sender: mapApiTypeToSender(h.tipo),
            timestamp: new Date(h.data_hora),
            origem: h.origem_contexto,
          })
        );

        setMessages(mappedMessages);
      } catch (err) {
        console.error("Erro ao carregar histórico:", err);
        setError("Erro ao carregar histórico da conversa.");
      } finally {
        setLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeConversationId]);

  // --- Handlers ---

  const handleNewChat = () => {
    setActiveConversationId(null);
    setIsSidebarOpen(false);
    setMessages([
      {
        id: "welcome",
        text: "Olá! Sou o **Touch**, seu assistente virtual do HOMIN+. Como posso te ajudar hoje?",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  };

  const handleSendMessage = async () => {
    setError(null);
    if (!inputMessage.trim()) return;

    if (!user) {
      await loginWithGoogle();
      return;
    }

    const text = inputMessage.trim();
    const tempId = `temp-msg-${Date.now()}`;

    // 1. Optimistic UI Update
    const userMessage: Message = {
      id: tempId,
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setInputMessage("");
    setLoadingSend(true);
    setMessages((prev) => [...prev, userMessage]);

    let currentConversationId = activeConversationId;
    const conversationIdToSend =
      typeof currentConversationId === "number" ? currentConversationId : null;

    try {
      // 2. Enviar para API
      const res = await sendMessage(text, conversationIdToSend);

      // 3. Processar resposta
      const botMessage: Message = {
        id: `resp-${Date.now()}`,
        text: res.response ?? "Sem resposta do servidor.",
        sender: "bot",
        timestamp: new Date(),
        origem: res.origem_contexto ?? null,
      };

      setMessages((prev) => [...prev, botMessage]);

      if (!conversationIdToSend && res.conversa_id) {
        setActiveConversationId(res.conversa_id);
        fetchConversationsList();
      }
    } catch (err: any) {
      console.error("Erro ao enviar:", err);
      setError(err?.response?.data?.detail ?? "Erro ao contatar servidor.");

      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        text: "⚠️ Falha ao enviar mensagem. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoadingSend(false);
    }
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    id: number | string
  ) => {
    e.stopPropagation();
    
    // Só permite deletar conversas com ID numérico (que existem no servidor)
    if (typeof id !== "number") {
      console.warn("Tentativa de deletar conversa local/temporária");
      return;
    }

    // Mostra o modal de confirmação
    setConversationToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete) return;

    setLoadingDelete(conversationToDelete);
    setShowDeleteModal(false);
    
    try {
      // Chama a API para deletar no servidor
      await deleteConversation(conversationToDelete);
      
      // Remove da lista local apenas após sucesso
      setConversations((prev: Conversation[]) => prev.filter((c) => c.id !== conversationToDelete));
      
      // Se estava na conversa deletada, vai para nova conversa
      if (activeConversationId === conversationToDelete) {
        handleNewChat();
      }
      
      console.log(`Conversa ${conversationToDelete} deletada com sucesso`);
    } catch (err) {
      console.error("Erro ao deletar conversa:", err);
      setError("Erro ao deletar conversa. Tente novamente.");
      
      // Remove o erro após alguns segundos
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoadingDelete(null);
      setConversationToDelete(null);
    }
  };

  const cancelDeleteConversation = () => {
    setShowDeleteModal(false);
    setConversationToDelete(null);
  };

  // Se não houver usuário, mostramos uma tela de login simples (mock)
  if (!user) {
    return navigate("/login");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Modal de Confirmação de Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Deletar Conversa</h3>
                  <p className="text-sm text-slate-600">Esta ação não pode ser desfeita</p>
                </div>
              </div>
              
              <p className="text-slate-700 mb-6">
                Tem certeza que deseja deletar esta conversa? Todo o histórico será perdido permanentemente.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteConversation}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteConversation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {loadingDelete ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deletando...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Deletar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overlay Mobile */}
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
        <div className="p-4 flex items-center justify-between border-b border-slate-800">
          <div
            className="flex items-center gap-2 text-white font-bold cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img src="/logo-white.svg" alt="HOMIN+ Logo" className="h-6" />
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
              </div>
              <button
                onClick={(e) => handleDeleteConversation(e, conv.id)}
                disabled={loadingDelete === conv.id}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-50 transition-all duration-200 p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Deletar conversa"
              >
                {loadingDelete === conv.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold border border-slate-600 overflow-hidden">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                user.username?.charAt(0).toUpperCase() || "U"
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {user.username || "Usuário"}
              </p>
              <p className="text-xs text-slate-500 truncate">Plano Gratuito</p>
            </div>
            <LogOut
              size={18}
              className="text-slate-500 group-hover:text-red-400"
              onClick={() => logout()}
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
          {/* Loader de Histórico Inicial */}
          {loadingHistory && messages.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <Loader2 size={32} className="animate-spin text-blue-600" />
            </div>
          )}

          {!loadingHistory &&
            messages.map((msg) => (
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

                  {/* Renderização Condicional: Markdown para Bot, Texto Puro para User */}
                  {msg.sender === "bot" ? (
                    <SimpleMarkdown text={msg.text} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  )}

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

          {loadingSend && (
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
                disabled={!inputMessage.trim() || loadingSend}
                className="mb-1 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95"
              >
                {loadingSend ? (
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

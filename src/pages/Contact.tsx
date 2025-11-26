import { Send, CheckCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import Header from "../components/Header"; // Importe o seu Header corrigido
import Footer from "../components/Footer";

export default function Contact() {
  const [formStatus, setFormStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");

    // Simula envio
    setTimeout(() => {
      setFormStatus("success");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* IMPORTANTE: Passamos color="fixed" para o Header pois esta página 
        tem fundo claro desde o topo, então o menu precisa ser cinza/visível.
      */}
      <Header color="fixed" />

      {/* --- Hero Section --- */}
      <section className="pt-32 pb-12 px-4 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Smartphone size={16} className="text-blue-600" />
            Fale Conosco
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
            Estamos aqui para <span className="text-blue-600">ouvir você.</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Dúvidas, sugestões ou parcerias? Escolha a melhor forma de falar com
            nosso time. Nossa equipe de suporte responde em até 24 horas.
          </p>
        </div>
      </section>

      {/* --- Seção do Formulário + Mapa/Info --- */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="w-full">
            <div className="bg-slate-50 p-8 md:p-10 rounded-3xl border border-slate-200">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Envie uma mensagem
              </h3>

              {formStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Mensagem Enviada!
                  </h4>
                  <p className="text-slate-600 mt-2 mb-6">
                    Recebemos seu contato e retornaremos em breve.
                  </p>
                  <button
                    onClick={() => setFormStatus("idle")}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm font-semibold text-slate-700"
                      >
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-semibold text-slate-700"
                      >
                        E-mail
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Assunto
                    </label>
                    <select
                      id="subject"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white text-slate-600"
                    >
                      <option>Dúvida Geral</option>
                      <option>Suporte Técnico</option>
                      <option>Parceria Comercial</option>
                      <option>Imprensa</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white resize-none"
                      placeholder="Como podemos ajudar?"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === "submitting"}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formStatus === "submitting" ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        Enviar Mensagem <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer (Idêntico à Home) --- */}
      <Footer />
    </main>
  );
}

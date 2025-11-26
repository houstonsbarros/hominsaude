import { AlertTriangle, Instagram, Map, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-slate-950 text-white pt-20 pb-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5 flex flex-col gap-8">
            <img
              src="/logo-white.svg"
              alt="HOMIN+ Logo"
              className="w-32 h-auto"
            />

            <div className="bg-slate-900 border-l-4 border-yellow-600 p-5 rounded-r-xl">
              <div className="flex items-center gap-2 mb-3 text-yellow-500">
                <AlertTriangle size={20} />
                <h4 className="font-bold text-sm uppercase tracking-wider">
                  Aviso Importante
                </h4>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                O HOMIN+ é uma ferramenta de educação e bem-estar. As
                informações geradas pela Inteligência Artificial não substituem
                o diagnóstico, aconselhamento ou tratamento médico profissional.
                Em caso de sintomas, procure um médico.
              </p>
            </div>

            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-all"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-600/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <Map size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Mapa do Site</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    Início
                  </a>
                </li>
                <li>
                  <a
                    href="#dicas"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    Dicas de Saúde
                  </a>
                </li>
                <li>
                  <a
                    href="equipe.html"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    Conheça a Equipe
                  </a>
                </li>
                <li>
                  <a
                    href="/contato"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    Fale Conosco
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 hover:border-blue-600/50 transition-colors group">
              <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Transparência</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors"></span>
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors"></span>
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-blue-500 transition-colors"></span>
                    Política de Cookies
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>
            &copy; {new Date().getFullYear()} HOMIN+. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

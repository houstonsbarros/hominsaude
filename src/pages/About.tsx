import { Instagram, Zap } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function AboutTeam() {
  const teamMembers = [
    {
      name: "dev.prii",
      image: "public/equipe/dev.prii.png",
      instagram: "https://www.instagram.com/dev.prii",
    },
    {
      name: "ian_zamba",
      image: "public/equipe/ian_zamba.png",
      instagram: "https://www.instagram.com/ian_zamba",
    },
    {
      name: "o_titox",
      image: "public/equipe/o_titox.jpg",
      instagram: "https://www.instagram.com/o_titox",
    },
    {
      name: "eh_neto",
      image: "public/equipe/eh_neto.png",
      instagram: "https://www.instagram.com/eh_neto",
    },
    {
      name: "dannykvlyn",
      image: "public/equipe/dannykvlyn.png",
      instagram: "https://www.instagram.com/dannykvlyn",
    },
    {
      name: "thurrr_29",
      image: "public/equipe/thurrr_29.jpg",
      instagram: "https://www.instagram.com/thurrr_29",
    },
    {
      name: "maycon.fp_",
      image: "public/equipe/maycon.fp_.png",
      instagram: "https://www.instagram.com/maycon.fp_",
    },
    {
      name: "_renosoo",
      image: "public/equipe/_renosoo.png",
      instagram: "https://www.instagram.com/_renosoo",
    },
    {
      name: "_marii.andr",
      image: "public/equipe/_maa.vitt2.jpg",
      instagram: "https://www.instagram.com/_marii.andr",
    },
    {
      name: "_maa.vitt",
      image: "public/equipe/_maa.vitt.jpg",
      instagram: "https://www.instagram.com/_maa.vitt",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <Header color="fixed" />

      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Zap size={16} className="text-blue-600" />
            Nossa Missão
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Transformando a saúde masculina através da{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-sky-500">
              tecnologia.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            O <strong>HOMIN+</strong> nasceu da necessidade de criar um espaço
            seguro e informativo. Unimos design, tecnologia e conhecimento
            validado para quebrar tabus e cuidar de quem importa.
          </p>

          <div className="pt-6 flex flex-col items-center justify-center gap-3 animate-fade-in-up">
            <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">
              Iniciativa Acadêmica
            </span>
            <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
              {/* <div className="bg-blue-900 p-2 rounded-lg text-yellow-400">
                <GraduationCap size={24} />
              </div> */}
              <div className="bg-blue-100 p-2 rounded-lg">
                <img
                  className="cover h-9 w-9 flex"
                  src="/public/logo_uninassau.svg"
                  alt="UNINASSAU Logo"
                />
              </div>
              <div className="text-left">
                <p className="text-xs text-gray-500 leading-none mb-1">
                  Projeto desenvolvido na
                </p>
                <p className="text-lg font-bold text-blue-900 leading-none">
                  UNINASSAU
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Quem Não Faz Acontecer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conheça as mentes dedicadas por trás do projeto. Uma equipe
              multidisciplinar unida pelo propósito.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-6 border border-gray-100 flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-blue-100"
              >
                {/* Moldura da Foto */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-sky-400 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-32 h-32 p-1 bg-linear-to-br from-blue-600 to-sky-400 rounded-full">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full border-4 border-white bg-gray-200"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff`;
                      }}
                    />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>

                <a
                  href={member.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto flex items-center gap-2 px-6 py-2 rounded-full bg-pink-50 text-pink-600 font-semibold text-sm transition-all duration-300 hover:bg-pink-600 hover:text-white hover:shadow-lg hover:shadow-pink-600/20"
                >
                  <Instagram size={18} />
                  Seguir
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

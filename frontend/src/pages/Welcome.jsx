// src/pages/Publica/Welcome.jsx
export default function Welcome() {
  return (
    <div className="bg-[#F4ECD8] text-[#1B1B18] font-['Work_Sans',sans-serif]">

      {/* HERO */}
      <header className="bg-[#12241F] text-[#F4ECD8] py-16 md:py-24">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="flex items-center gap-2.5 text-[15px] text-[#E8B23D] mb-10">
            <svg viewBox="0 0 24 24" fill="none" stroke="#E8B23D" strokeWidth="1.6" className="w-[22px] h-[22px]">
              <path d="M3 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"/>
              <path d="M12 3v10"/>
              <path d="M12 5l5 3-5 3"/>
            </svg>
            Veleja
          </div>

          <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-12 items-end">
            <div className="border border-white/20 p-7 md:p-8 max-w-[460px]">
              <p className="text-sm text-[#b7c9c2] mb-1.5">Próximo embarque</p>
              <h1 className="font-['Fraunces',serif] text-[32px] md:text-[40px] font-medium leading-tight mb-4">
                Belém para Soure, todos os dias ao amanhecer
              </h1>
              <p className="text-[#cdd8d2] text-[15px] mb-5 max-w-[40ch]">
                Passagens e horários das linhas fluviais que ligam a capital às ilhas do Marajó.
              </p>
              <div className="flex items-baseline gap-2.5 border-t border-white/20 pt-4">
                <span className="font-['Fraunces',serif] text-[34px] font-medium text-[#E8B23D]">05:30</span>
                <span className="text-[13px] text-[#b7c9c2]">Embarque no Porto do Ver-o-Peso — chegada prevista 09:15</span>
              </div>
              
                href="#viagens"
                className="inline-block mt-6 bg-[#A6672B] hover:bg-[#8f5624] text-[#F4ECD8] px-6 py-3 text-[15px] font-medium"
              <a>
                Ver todas as viagens
              </a>
            </div>

            <svg viewBox="0 0 480 260" className="w-full h-auto hidden md:block">
              <path d="M40,220 C120,180 100,110 200,90 S320,40 440,40" fill="none" stroke="#3f5850" strokeWidth="2"/>

              <circle cx="40" cy="220" r="7" fill="#E8B23D" stroke="#E8B23D" strokeWidth="2"/>
              <text x="52" y="216" fontSize="13" fill="#F4ECD8" fontWeight="500">Belém</text>
              <text x="52" y="234" fontSize="12" fill="#cdd8d2">Ver-o-Peso</text>

              <circle cx="150" cy="140" r="6" fill="#12241F" stroke="#E8B23D" strokeWidth="2"/>
              <text x="162" y="136" fontSize="13" fill="#F4ECD8" fontWeight="500">Icoaraci</text>

              <circle cx="290" cy="70" r="6" fill="#12241F" stroke="#E8B23D" strokeWidth="2"/>
              <text x="302" y="66" fontSize="13" fill="#F4ECD8" fontWeight="500">Salvaterra</text>

              <circle cx="440" cy="40" r="7" fill="#12241F" stroke="#E8B23D" strokeWidth="2"/>
              <text x="400" y="24" fontSize="13" fill="#F4ECD8" fontWeight="500">Soure</text>
            </svg>
          </div>
        </div>
      </header>

      {/* PRÓXIMAS VIAGENS */}
      <section id="viagens" className="py-20">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="flex justify-between items-end mb-9">
            <h2 className="font-['Fraunces',serif] text-[28px] font-medium">Próximas viagens</h2>
            <span className="text-sm text-[#6b6a5f]">Atualizado hoje, 05 de setembro</span>
          </div>

          <div className="border-t border-[#d9d0ba]">
            {[
              { dia: "06", mes: "set", rota: "Belém → Soure", barco: "Barco Estrela do Marajó", saida: "Saída 05:30", chegada: "Chegada 09:15", status: "confirmada" },
              { dia: "06", mes: "set", rota: "Belém → Breves", barco: "Barco Rio Acima", saida: "Saída 14:00", chegada: "Chegada 20:30", status: "confirmada" },
              { dia: "07", mes: "set", rota: "Belém → Afuá", barco: "Barco Filha do Rio", saida: "Saída 06:00", chegada: "Chegada 15:00", status: "aconfirmar" },
            ].map((v, i) => (
              <div key={i} className="grid grid-cols-[60px_1fr_90px] md:grid-cols-[90px_1fr_1fr_90px_100px] gap-4 items-center py-5 border-b border-[#d9d0ba] text-sm">
                <div className="font-['Fraunces',serif] text-[22px]">
                  {v.dia}
                  <small className="block font-['Work_Sans',sans-serif] text-[11px] text-[#8a8874]">{v.mes}</small>
                </div>
                <div className="font-medium">
                  {v.rota}
                  <small className="block font-normal text-[#6b6a5f] text-xs">{v.barco}</small>
                </div>
                <div className="hidden md:block font-medium">
                  {v.saida}
                  <small className="block font-normal text-[#6b6a5f] text-xs">{v.chegada}</small>
                </div>
                <div className={`text-xs px-2.5 py-1.5 border text-center ${
                  v.status === "confirmada" ? "text-[#3E7D6F] border-[#3E7D6F]" : "text-[#A6672B] border-[#A6672B]"
                }`}>
                  {v.status === "confirmada" ? "Confirmada" : "A confirmar"}
                </div>
                <div className="hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FROTA */}
      <section className="bg-[#efe6cf] py-20">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="flex justify-between items-end mb-9">
            <h2 className="font-['Fraunces',serif] text-[28px] font-medium">A frota</h2>
            <span className="text-sm text-[#6b6a5f]">3 embarcações em operação</span>
          </div>

          <div className="grid md:grid-cols-3 border border-[#d9c9a3]">
            {[
              { nome: "Estrela do Marajó", cap: "120 passageiros", servicos: ["Rede", "Lanchonete", "Banheiro"] },
              { nome: "Rio Acima", cap: "80 passageiros", servicos: ["Camarote", "Ar-condicionado", "Wi-Fi"] },
              { nome: "Filha do Rio", cap: "150 passageiros", servicos: ["Rede", "Banheiro", "Outros"] },
            ].map((b, i, arr) => (
              <div
                key={i}
                className={`p-7 relative ${i < arr.length - 1 ? "md:border-r border-b md:border-b-0 border-dashed border-[#c9b98a]" : ""}`}
              >
                <h3 className="text-lg font-medium mb-1.5">{b.nome}</h3>
                <p className="text-[13px] text-[#8a8874] mb-3.5">{b.cap}</p>
                <div className="flex flex-wrap gap-1.5">
                  {b.servicos.map((s, j) => (
                    <span key={j} className="text-[11px] border border-[#c9b98a] px-2 py-0.5 text-[#6b6a5f]">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PORTOS */}
      <section className="py-20 md:py-24">
        <div className="max-w-[1120px] mx-auto px-8">
          <div className="flex justify-between items-end mb-9">
            <h2 className="font-['Fraunces',serif] text-[28px] font-medium">Portos atendidos</h2>
            <span className="text-sm text-[#6b6a5f]">4 municípios</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-7">
            {[
              { nome: "Ver-o-Peso", cidade: "Belém" },
              { nome: "Porto de Icoaraci", cidade: "Belém" },
              { nome: "Terminal de Salvaterra", cidade: "Salvaterra" },
              { nome: "Porto de Soure", cidade: "Soure" },
            ].map((p, i) => (
              <div key={i} className="border-l-2 border-[#3E7D6F] pl-4">
                <h4 className="text-base font-medium mb-1">{p.nome}</h4>
                <p className="text-[13px] text-[#6b6a5f]">{p.cidade}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#12241F] text-[#b7c9c2] py-10 text-[13px]">
        <div className="max-w-[1120px] mx-auto px-8">Veleja — navegação fluvial no Pará</div>
      </footer>
    </div>
  );
}
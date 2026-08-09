// Painel administrativo da Veleja
// Menu lateral (desktop) ou abas horizontais (mobile) pra navegar
// entre as seções de gerenciamento

import { useState } from 'react';

const SECOES = [
  { id: 'barcos', rotulo: 'Barcos' },
  { id: 'portos', rotulo: 'Portos' },
  { id: 'municipios', rotulo: 'Municípios' },
  { id: 'banco-dados', rotulo: 'Banco de dados' },
  { id: 'informar-viagem', rotulo: 'Informar viagem' },
  { id: 'gerenciar-viagens', rotulo: 'Gerenciar viagens' },
];

function Dashboard() {
  const [secaoAtiva, setSecaoAtiva] = useState('barcos');

  const secaoAtual = SECOES.find((secao) => secao.id === secaoAtiva);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row">
      {/* Sidebar (desktop) / Abas horizontais (mobile) */}
      <nav className="md:w-56 bg-[#0a2e5c] border-b md:border-b-0 md:border-r border-white/10 md:min-h-[calc(100vh-64px)]">
        <ul className="flex md:flex-col overflow-x-auto md:overflow-visible">
          {SECOES.map((secao) => (
            <li key={secao.id} className="flex-shrink-0 md:flex-shrink">
              <button
                onClick={() => setSecaoAtiva(secao.id)}
                className={`
                  w-full text-left px-4 py-3 whitespace-nowrap
                  font-medium transition-colors
                  ${secaoAtiva === secao.id
                    ? 'bg-[#041f43] text-[#00D9E9]'
                    : 'text-gray-300 hover:bg-white/5'}
                `}
              >
                {secao.rotulo}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Conteúdo principal */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-4">
          Veleja Dashboard
        </h1>
        <div className="bg-[#0a2e5c] border border-white/10 rounded-xl p-6">
          <p className="text-gray-300">
            Seção selecionada: <span className="font-semibold text-white">{secaoAtual?.rotulo}</span>
          </p>
          <p className="text-gray-500 text-sm mt-2">
            (conteúdo dessa seção ainda vai ser construído)
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
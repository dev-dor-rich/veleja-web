import { useState } from 'react';
import Municipios from './modulos/Municipios';
import Portos from './modulos/Portos';
import Barcos from './modulos/Barcos';
import GerenciarViagens from './modulos/GerenciarViagens';
import InformarViagem from './modulos/InformarViagem';
import BancoDados from './modulos/BancoDados';

const SECOES = [
  { id: 'barcos', rotulo: 'Barcos' },
  { id: 'portos', rotulo: 'Portos' },
  { id: 'municipios', rotulo: 'Municipios' },
  { id: 'banco-dados', rotulo: 'Banco de dados' },
  { id: 'informar-viagem', rotulo: 'Informar viagem' },
  { id: 'gerenciar-viagens', rotulo: 'Gerenciar viagens' },
];

function Dashboard() {
  const [secaoAtiva, setSecaoAtiva] = useState('barcos');

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col md:flex-row">
      <nav className="md:w-56 bg-[#0a2e5c] border-b md:border-b-0 md:border-r border-white/10 md:min-h-[calc(100vh-64px)]">
        <ul className="flex md:flex-col overflow-x-auto md:overflow-visible">
          {SECOES.map((secao) => (
            <li key={secao.id} className="flex-shrink-0 md:flex-shrink">
              <button
                onClick={() => setSecaoAtiva(secao.id)}
                className={
                  'w-full text-left px-4 py-3 whitespace-nowrap font-medium transition-colors ' +
                  (secaoAtiva === secao.id
                    ? 'bg-[#041f43] text-[#00D9E9]'
                    : 'text-gray-300 hover:bg-white/5')
                }
              >
                {secao.rotulo}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Veleja Dashboard</h1>

        {secaoAtiva === 'municipios' && <Municipios />}
        {secaoAtiva === 'portos' && <Portos />}
        {secaoAtiva === 'barcos' && <Barcos />}
        {secaoAtiva === 'banco-dados' && <BancoDados />}
        {secaoAtiva === 'informar-viagem' && <InformarViagem />}
        {secaoAtiva === 'gerenciar-viagens' && <GerenciarViagens />}
      </main>
    </div>
  );
}

export default Dashboard;

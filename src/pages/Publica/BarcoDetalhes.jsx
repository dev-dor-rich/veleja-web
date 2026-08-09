// Página de detalhes de um barco específico
// Acessada ao clicar num card na tela "Vamos Lá" (/barco/:id)
// Mostra imagens, amenidades e (futuramente) rota/mapa

import { useParams, Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const BARCOS_EXEMPLO = [
  {
    id: 1,
    nome: 'Estrela do Pará',
    capacidade: '120 passageiros',
    amenidades: ['Rede', 'Lanchonete', 'Banheiro'],
  },
  {
    id: 2,
    nome: 'Rainha do Rio',
    capacidade: '80 passageiros',
    amenidades: ['Ar-condicionado', 'Banheiro', 'Aceita cartão'],
  },
  {
    id: 3,
    nome: 'Filha das Águas',
    capacidade: '150 passageiros',
    amenidades: ['Rede', 'Lanchonete', 'Wi-Fi'],
  },
];

function BarcoDetalhes() {
  const { id } = useParams();
  const barco = BARCOS_EXEMPLO.find((item) => item.id === Number(id));

  if (!barco) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-300">Barco não encontrado.</p>
        <Link to="/vamos-la" className="text-[#00D9E9] font-medium">
          Voltar pra Vamos Lá
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/vamos-la" className="text-[#00D9E9] font-medium mb-4 inline-block">
          ← Voltar
        </Link>

        <div className="bg-[#0a2e5c] border border-white/10 rounded-xl overflow-hidden">
          <div className="h-56 bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-7xl">
            ⛵
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Veleja" className="h-[36px]" />
              <h1 className="text-2xl font-bold text-white">{barco.nome}</h1>
            </div>

            <p className="text-gray-400 mb-4">{barco.capacidade}</p>

            <h2 className="font-semibold text-gray-200 mb-2">O que esse barco oferece</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {barco.amenidades.map((item) => (
                <span
                  key={item}
                  className="text-sm bg-white/10 text-gray-200 px-3 py-1.5 rounded-full"
                >
                  {item}
                </span>
              ))}
            </div>

            <h2 className="font-semibold text-gray-200 mb-2">Rota</h2>
            <div className="h-40 bg-[#041f43] border border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-sm">
              Mapa da rota (em breve)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcoDetalhes;
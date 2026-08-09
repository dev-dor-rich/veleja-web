// Página pública "Vamos Lá"
// Tela principal onde o visitante (sem login) filtra e visualiza
// os barcos disponíveis pra uma rota e data específicas

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import logo from '../../assets/logo.svg';

const PORTOS = ['Belém', 'Icoaraci', 'Soure', 'Salvaterra', 'Breves', 'Abaetetuba'];

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

function VamosLa() {
  const [dataViagem, setDataViagem] = useState('');
  const [portoOrigem, setPortoOrigem] = useState('');
  const [portoDestino, setPortoDestino] = useState('');

  const handleBuscar = (evento) => {
    evento.preventDefault();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Veleja" className="h-[80px] mb-3" />
          <h1 className="text-2xl font-bold text-white">
            Para onde você quer ir?
          </h1>
        </div>

        {/* Filtros */}
        <form
          onSubmit={handleBuscar}
          className="bg-[#0a2e5c] border border-white/10 rounded-xl shadow-sm p-6 mb-10 flex flex-col md:flex-row gap-4 md:items-end"
        >
          <div className="flex-1">
            <label htmlFor="dataViagem" className="block text-sm font-medium text-gray-300 mb-1">
              Data da viagem
            </label>
            <input
              id="dataViagem"
              type="date"
              value={dataViagem}
              onChange={(evento) => setDataViagem(evento.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="portoOrigem" className="block text-sm font-medium text-gray-300 mb-1">
              Porto de origem
            </label>
            <select
              id="portoOrigem"
              value={portoOrigem}
              onChange={(evento) => setPortoOrigem(evento.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            >
              <option value="">Selecione</option>
              {PORTOS.map((porto) => (
                <option key={porto} value={porto}>{porto}</option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label htmlFor="portoDestino" className="block text-sm font-medium text-gray-300 mb-1">
              Porto de destino
            </label>
            <select
              id="portoDestino"
              value={portoDestino}
              onChange={(evento) => setPortoDestino(evento.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            >
              <option value="">Selecione</option>
              {PORTOS.map((porto) => (
                <option key={porto} value={porto}>{porto}</option>
              ))}
            </select>
          </div>

          <Button type="submit" tipo="primary" tamanho="medium">
            Buscar
          </Button>
        </form>

        {/* Cards de barcos disponíveis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BARCOS_EXEMPLO.map((barco) => (
            <Link
              key={barco.id}
              to={`/barco/${barco.id}`}
              className="bg-[#0a2e5c] border border-white/10 rounded-xl overflow-hidden hover:border-[#00D9E9]/50 transition-colors"
            >
              <div className="h-40 bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-5xl">
                ⛵
              </div>

              <div className="p-4">
                <h2 className="font-bold text-white mb-1">{barco.nome}</h2>
                <p className="text-gray-400 text-sm mb-3">{barco.capacidade}</p>

                <div className="flex flex-wrap gap-1.5">
                  {barco.amenidades.map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VamosLa;
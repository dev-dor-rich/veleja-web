import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import useDadosStore from '../../store/useDadosStore';
import logo from '../../assets/logo.svg';

const STATUS_CLASSES = {
  'confirmada': { rotulo: 'Confirmada', textColor: '#4ade80', borderColor: '#4ade80' },
  'a-confirmar': { rotulo: 'A Confirmar', textColor: '#facc15', borderColor: '#facc15' },
  'cancelada': { rotulo: 'Cancelada', textColor: '#f87171', borderColor: '#f87171' },
  'extraordinaria': { rotulo: 'Viagem Extraordinária', textColor: '#c084fc', borderColor: '#c084fc' },
};


function VamosLa() {
  const listaViagens = useDadosStore((s) => s.listaViagens);
  const listaBarcos = useDadosStore((s) => s.listaBarcos);
  const listaPortos = useDadosStore((s) => s.listaPortos);
  const listaMunicipios = useDadosStore((s) => s.listaMunicipios);

  const [buscaMunicipio, setBuscaMunicipio] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroData, setFiltroData] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');

  const nomeBarco = (id) => listaBarcos.find((b) => b.id === id)?.nome || 'indefinido';
  const nomePorto = (id) => listaPortos.find((p) => p.id === id)?.nome || 'indefinido';
  const fotoBarco = (id) => listaBarcos.find((b) => b.id === id)?.fotoUrl || null;
  const municipioDoPorto = (portoId) => {
    const porto = listaPortos.find((p) => p.id === portoId);
    if (!porto) return '';
    const municipio = listaMunicipios.find((m) => m.id === porto.municipioId);
    return municipio ? municipio.nome.toLowerCase() : '';
  };

  // Filtra viagens pela busca de municipio e filtros avancados
  const viagensFiltradas = useMemo(() => {
    return listaViagens.filter((viagem) => {
      // Busca por municipio (origem ou destino)
      if (buscaMunicipio.trim()) {
        const termo = buscaMunicipio.toLowerCase();
        const municipioOrigem = municipioDoPorto(viagem.portoSaidaId);
        const municipioDestino = municipioDoPorto(viagem.portoChegadaId);
        if (!municipioOrigem.includes(termo) && !municipioDestino.includes(termo)) {
          return false;
        }
      }

      // Filtro por data
      if (filtroData && viagem.dataViagem !== filtroData) return false;

      // Filtro por porto de origem
      if (filtroOrigem && viagem.portoSaidaId !== filtroOrigem) return false;

      // Filtro por porto de destino
      if (filtroDestino && viagem.portoChegadaId !== filtroDestino) return false;

      return true;
    });
  }, [listaViagens, buscaMunicipio, filtroData, filtroOrigem, filtroDestino]);

  const temFiltroAtivo = filtroData || filtroOrigem || filtroDestino;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-5xl mx-auto">

        {/* Cabecalho */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Veleja" className="h-[80px] mb-3" />
          <h1 className="text-2xl font-bold text-white mb-6">
            Para onde voce quer ir?
          </h1>

          {/* Barra de busca por municipio */}
          <div className="w-full max-w-lg">
            <input
              type="text"
              value={buscaMunicipio}
              onChange={(e) => setBuscaMunicipio(e.target.value)}
              placeholder="Buscar municipio de origem ou destino..."
              className="w-full bg-[#0a2e5c] border border-white/20 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-base placeholder-gray-500"
            />
          </div>

          {/* Botao de filtros avancados */}
          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="mt-3 text-sm text-gray-400 hover:text-[#00D9E9] transition-colors flex items-center gap-1"
          >
            {filtrosAbertos ? 'Ocultar filtros' : 'Filtros avancados'}
            {temFiltroAtivo && (
              <span className="w-2 h-2 bg-[#00D9E9] rounded-full inline-block" />
            )}
          </button>

          {/* Filtros avancados (colapsaveis) */}
          {filtrosAbertos && (
            <div className="w-full max-w-2xl mt-4 bg-[#0a2e5c] border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Data</label>
                <input
                  type="date"
                  value={filtroData}
                  onChange={(e) => setFiltroData(e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Porto de origem</label>
                <select
                  value={filtroOrigem}
                  onChange={(e) => setFiltroOrigem(e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-sm"
                >
                  <option value="">Todos</option>
                  {listaPortos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Porto de destino</label>
                <select
                  value={filtroDestino}
                  onChange={(e) => setFiltroDestino(e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-sm"
                >
                  <option value="">Todos</option>
                  {listaPortos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))}
                </select>
              </div>
              {temFiltroAtivo && (
                <button
                  onClick={() => { setFiltroData(''); setFiltroOrigem(''); setFiltroDestino(''); }}
                  className="md:col-span-3 text-xs text-red-400 hover:text-red-300 text-left"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Cards de viagens */}
        {listaViagens.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Nenhuma viagem disponivel no momento.</p>
          </div>
        ) : viagensFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Nenhuma viagem encontrada para essa busca.</p>
            <button
              onClick={() => { setBuscaMunicipio(''); setFiltroData(''); setFiltroOrigem(''); setFiltroDestino(''); }}
              className="text-sm text-[#00D9E9] mt-2 hover:underline"
            >
              Limpar busca
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {viagensFiltradas.map((viagem) => {
              const foto = fotoBarco(viagem.barcoId);
              const statusInfo = STATUS_INFO[viagem.status] || STATUS_INFO['a-confirmar'];

              return (
                <Link
                  key={viagem.id}
                  to={'/viagem/' + viagem.id}
                  className="bg-[#0a2e5c] border border-white/10 rounded-xl overflow-hidden hover:border-[#00D9E9]/50 transition-colors"
                >
                  {/* Foto ou placeholder */}
                  {foto ? (
                    <img src={foto} alt={nomeBarco(viagem.barcoId)} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-5xl">
                      ⛵
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    {/* Status */}
                    <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + statusInfo.classe}>
                     {statusInfo.rotulo}
                    </span>


                    {/* Nome do barco */}
                    <h2 className="font-bold text-white">{nomeBarco(viagem.barcoId)}</h2>

                    {/* Rota */}
                    <p className="text-gray-400 text-sm">
                      {nomePorto(viagem.portoSaidaId)} → {nomePorto(viagem.portoChegadaId)}
                    </p>

                    {/* Data */}
                    <p className="text-gray-400 text-sm">{viagem.dataViagem}</p>

                    {/* Horario de partida */}
                    {viagem.horarioPartida && (
                      <p className="text-[#00D9E9] text-sm font-medium">
                        Partida: {viagem.horarioPartida}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default VamosLa;

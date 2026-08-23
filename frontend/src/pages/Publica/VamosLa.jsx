import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.svg';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

const STATUS_INFO = {
  'confirmada': { rotulo: 'Confirmada', classe: 'text-green-400 bg-green-400/10 border border-green-400/30' },
  'a-confirmar': { rotulo: 'A Confirmar', classe: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30' },
  'cancelada': { rotulo: 'Cancelada', classe: 'text-red-400 bg-red-400/10 border border-red-400/30' },
  'extraordinaria': { rotulo: 'Viagem Extraordinária', classe: 'text-purple-400 bg-purple-400/10 border border-purple-400/30' },
};

function VamosLa() {
  const [listaViagens, setListaViagens] = useState([]);
  const [listaBarcos, setListaBarcos] = useState([]);
  const [listaPortos, setListaPortos] = useState([]);
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [buscaMunicipio, setBuscaMunicipio] = useState('');
  const [filtrosAbertos, setFiltrosAbertos] = useState(false);
  const [filtroData, setFiltroData] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [filtroDestino, setFiltroDestino] = useState('');

  useEffect(() => {
    setCarregando(true);
    setErro('');

    Promise.all([
      fetch(`${API_URL}/api/municipios.php`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/api/portos.php`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/api/barcos.php`, { credentials: 'include' }).then((r) => r.json()),
      fetch(`${API_URL}/api/viagens.php`, { credentials: 'include' }).then((r) => r.json()),
    ])
      .then(([respMunicipios, respPortos, respBarcos, respViagens]) => {
        if (respMunicipios.sucesso) setListaMunicipios(respMunicipios.dados);

        if (respPortos.sucesso) {
          const portosFormatados = respPortos.dados.map((p) => ({
            id: p.id,
            nome: p.nome,
            municipioId: p.municipio_id,
          }));
          setListaPortos(portosFormatados);
        }

        if (respBarcos.sucesso) {
          const barcosFormatados = respBarcos.dados.map((b) => ({
            ...b,
            capacidadeMaxima: b.capacidade_maxima,
            horarioPartida: b.horario_partida,
            fotoUrl: b.foto_url,
          }));
          setListaBarcos(barcosFormatados);
        }

        if (respViagens.sucesso) {
          const viagensFormatadas = respViagens.dados.map((v) => ({
            ...v,
            barcoId: v.barcoId ?? v.barco_id,
            portoSaidaId: v.portoSaidaId ?? v.porto_saida_id,
            horarioPartida: v.horarioPartida ?? v.horario_partida,
            portoChegadaId: v.portoChegadaId ?? v.porto_chegada_id,
            horarioChegada: v.horarioChegada ?? v.horario_chegada,
            dataViagem: v.dataViagem ?? v.data_viagem,
          }));
          setListaViagens(viagensFormatadas);
        } else {
          setErro(respViagens.mensagem || 'Erro ao carregar viagens');
        }
      })
      .catch(() => setErro('Erro ao conectar com o servidor'))
      .finally(() => setCarregando(false));
  }, []);

  const nomeBarco = (id) => listaBarcos.find((b) => String(b.id) === String(id))?.nome || 'indefinido';
  const nomePorto = (id) => listaPortos.find((p) => String(p.id) === String(id))?.nome || 'indefinido';
  const fotoBarco = (id) => listaBarcos.find((b) => String(b.id) === String(id))?.fotoUrl || null;
  const municipioDoPorto = (portoId) => {
    const porto = listaPortos.find((p) => String(p.id) === String(portoId));
    if (!porto) return '';
    const municipio = listaMunicipios.find((m) => String(m.id) === String(porto.municipioId));
    return municipio ? municipio.nome.toLowerCase() : '';
  };

  const viagensFiltradas = useMemo(() => {
    return listaViagens.filter((viagem) => {
      const barcoExiste = listaBarcos.some((b) => String(b.id) === String(viagem.barcoId));
      if (!barcoExiste) return false;

      if (buscaMunicipio.trim()) {
        const termo = buscaMunicipio.toLowerCase();
        const municipioOrigem = municipioDoPorto(viagem.portoSaidaId);
        const municipioDestino = municipioDoPorto(viagem.portoChegadaId);
        if (!municipioOrigem.includes(termo) && !municipioDestino.includes(termo)) {
          return false;
        }
      }

      if (filtroData && viagem.dataViagem !== filtroData) return false;
      if (filtroOrigem && String(viagem.portoSaidaId) !== String(filtroOrigem)) return false;
      if (filtroDestino && String(viagem.portoChegadaId) !== String(filtroDestino)) return false;

      return true;
    });
  }, [listaViagens, listaBarcos, buscaMunicipio, filtroData, filtroOrigem, filtroDestino]);

  const temFiltroAtivo = filtroData || filtroOrigem || filtroDestino;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex flex-col items-center text-center mb-8">
          <img src={logo} alt="Veleja" className="h-[80px] mb-3" />
          <h1 className="text-2xl font-bold text-white mb-6">
            Para onde voce quer ir?
          </h1>

          <div className="w-full max-w-lg">
            <input
              type="text"
              value={buscaMunicipio}
              onChange={(e) => setBuscaMunicipio(e.target.value)}
              placeholder="Buscar municipio de origem ou destino..."
              className="w-full bg-[#0a2e5c] border border-white/20 text-white rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-base placeholder-gray-500"
            />
          </div>

          <button
            onClick={() => setFiltrosAbertos(!filtrosAbertos)}
            className="mt-3 text-sm text-gray-400 hover:text-[#00D9E9] transition-colors flex items-center gap-1"
          >
            {filtrosAbertos ? 'Ocultar filtros' : 'Filtros avancados'}
            {temFiltroAtivo && (
              <span className="w-2 h-2 bg-[#00D9E9] rounded-full inline-block" />
            )}
          </button>

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

        {erro && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 mb-6 max-w-lg mx-auto">
            <p className="text-red-400 text-sm text-center">{erro}</p>
          </div>
        )}

        {carregando ? (
          <div className="text-center py-16">
            <p className="text-gray-500">Carregando viagens...</p>
          </div>
        ) : listaViagens.length === 0 ? (
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
                  {foto ? (
                    <img src={foto} alt={nomeBarco(viagem.barcoId)} className="h-40 w-full object-cover" />
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-5xl">
                      ⛵
                    </div>
                  )}

                  <div className="p-4 space-y-2">
                    <span className={'text-xs font-semibold px-2 py-1 rounded-full ' + statusInfo.classe}>
                     {statusInfo.rotulo}
                    </span>

                    <h2 className="font-bold text-white">{nomeBarco(viagem.barcoId)}</h2>

                    <p className="text-gray-400 text-sm">
                      {nomePorto(viagem.portoSaidaId)} → {nomePorto(viagem.portoChegadaId)}
                    </p>

                    <p className="text-gray-400 text-sm">{viagem.dataViagem}</p>

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
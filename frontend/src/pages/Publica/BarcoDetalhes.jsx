import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../../assets/logo.svg';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

const STATUS_INFO = {
  'confirmada': { rotulo: 'Confirmada', cor: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  'a-confirmar': { rotulo: 'A Confirmar', cor: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  'cancelada': { rotulo: 'Cancelada', cor: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  'extraordinaria': { rotulo: 'Viagem Extraordinaria', cor: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
};

function BarcoDetalhes() {
  const { id } = useParams();

  const [viagem, setViagem] = useState(null);
  const [barco, setBarco] = useState(null);
  const [listaPortos, setListaPortos] = useState([]);
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

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

        let portosFormatados = [];
        if (respPortos.sucesso) {
          portosFormatados = respPortos.dados.map((p) => ({
            id: p.id,
            nome: p.nome,
            municipioId: p.municipio_id,
            endereco: p.endereco,
            latitude: p.latitude,
            longitude: p.longitude,
            possuiPracaAlimentacao: !!p.possui_praca_alimentacao,
          }));
          setListaPortos(portosFormatados);
        }

        let barcosFormatados = [];
        if (respBarcos.sucesso) {
          barcosFormatados = respBarcos.dados.map((b) => ({
            ...b,
            capacidadeMaxima: b.capacidade_maxima,
            horarioPartida: b.horario_partida,
            fotoUrl: b.foto_url,
          }));
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

          const viagemEncontrada = viagensFormatadas.find((v) => String(v.id) === String(id));
          setViagem(viagemEncontrada || null);

          if (viagemEncontrada) {
            const barcoEncontrado = barcosFormatados.find(
              (b) => String(b.id) === String(viagemEncontrada.barcoId)
            );
            setBarco(barcoEncontrado || null);
          }
        } else {
          setErro(respViagens.mensagem || 'Erro ao carregar viagem');
        }
      })
      .catch(() => setErro('Erro ao conectar com o servidor'))
      .finally(() => setCarregando(false));
  }, [id]);

  const nomeMunicipio = (municipioId) => {
    return listaMunicipios.find((m) => String(m.id) === String(municipioId))?.nome || '';
  };

  const nomePorto = (portoId) => {
    return listaPortos.find((p) => String(p.id) === String(portoId))?.nome || 'indefinido';
  };

  const linkMaps = (porto) => {
    if (!porto) return null;
    if (porto.latitude && porto.longitude) {
      return 'https://www.google.com/maps?q=' + porto.latitude + ',' + porto.longitude;
    }
    if (porto.endereco) {
      return 'https://www.google.com/maps/search/' + encodeURIComponent(porto.endereco);
    }
    return null;
  };

  const linkUber = (porto) => {
    if (!porto || !porto.latitude || !porto.longitude) return null;
    return 'https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=' +
      porto.latitude + '&dropoff[longitude]=' + porto.longitude +
      '&dropoff[nickname]=' + encodeURIComponent(porto.nome || 'Porto');
  };

  const link99 = (porto) => {
    if (!porto || !porto.latitude || !porto.longitude) return null;
    return 'https://99app.com/corrida?lat=' + porto.latitude + '&lng=' + porto.longitude;
  };

  if (carregando) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (erro || !viagem) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-300">{erro || 'Viagem nao encontrada.'}</p>
        <Link to="/vamos-la" className="text-[#00D9E9] font-medium hover:underline">
          Voltar para Vamos La
        </Link>
      </div>
    );
  }

  const portoSaida = listaPortos.find((p) => String(p.id) === String(viagem.portoSaidaId));
  const portoChegada = listaPortos.find((p) => String(p.id) === String(viagem.portoChegadaId));
  const statusInfo = STATUS_INFO[viagem.status] || STATUS_INFO['a-confirmar'];

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-4">

        <Link to="/vamos-la" className="text-[#00D9E9] font-medium inline-block hover:underline">
          Voltar
        </Link>

        <div className="bg-[#0a2e5c] border border-white/10 rounded-xl overflow-hidden">

          {barco?.fotoUrl ? (
            <img src={barco.fotoUrl} alt={barco.nome} className="h-56 w-full object-cover" />
          ) : (
            <div className="h-56 bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-7xl">
              ⛵
            </div>
          )}

          <div className="p-6 space-y-6">

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Veleja" className="h-[36px]" />
                <div>
                  <h1 className="text-2xl font-bold text-white">{barco?.nome || 'indefinido'}</h1>
                  <p className="text-gray-400 text-sm">{barco?.capacidadeMaxima} passageiros</p>
                </div>
              </div>
              <span className={'text-xs font-semibold px-3 py-1.5 rounded-full border ' + statusInfo.cor + ' ' + statusInfo.bg}>
                {statusInfo.rotulo}
              </span>
            </div>

            {barco?.servicos && barco.servicos.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-200 mb-2">O que esse barco oferece</h2>
                <div className="flex flex-wrap gap-2">
                  {barco.servicos.map((s) => (
                    <span key={s} className="text-sm bg-white/10 text-gray-200 px-3 py-1.5 rounded-full">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <h2 className="font-semibold text-gray-200 mb-2">Informacoes da viagem</h2>
              <p className="text-gray-400 text-sm">Data: <span className="text-white">{viagem.dataViagem}</span></p>
            </div>

            <div className="space-y-3">
              <h2 className="font-semibold text-gray-200">Rota</h2>

              <div className="bg-[#041f43] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-[#00D9E9] rounded-full" />
                  <p className="text-[#00D9E9] text-xs font-semibold">SAIDA</p>
                </div>
                <p className="text-white font-medium">{portoSaida?.nome}</p>
                {nomeMunicipio(portoSaida?.municipioId) && (
                  <p className="text-gray-400 text-sm">{nomeMunicipio(portoSaida?.municipioId)}</p>
                )}
                {portoSaida?.endereco && (
                  <p className="text-gray-400 text-sm">{portoSaida.endereco}</p>
                )}
                {viagem.horarioPartida && (
                  <p className="text-[#00D9E9] text-sm font-medium">Partida: {viagem.horarioPartida}</p>
                )}
                {linkMaps(portoSaida) && (
                  <a href={linkMaps(portoSaida)} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#00D9E9] hover:underline inline-block mt-1">
                    Ver no Google Maps
                  </a>
                )}
              </div>

              {viagem.paradas && viagem.paradas.length > 0 && viagem.paradas.map((parada, i) => {
                const portoParada = listaPortos.find((p) => String(p.id) === String(parada.portoId));
                return (
                  <div key={i} className="bg-[#041f43] border border-white/10 rounded-xl p-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[#D4A574] rounded-full" />
                      <p className="text-[#D4A574] text-xs font-semibold">PARADA {i + 1}</p>
                    </div>
                    <p className="text-white font-medium">{nomePorto(parada.portoId)}</p>
                    {nomeMunicipio(portoParada?.municipioId) && (
                      <p className="text-gray-400 text-sm">{nomeMunicipio(portoParada?.municipioId)}</p>
                    )}
                  </div>
                );
              })}

              <div className="bg-[#041f43] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                  <p className="text-green-400 text-xs font-semibold">DESTINO FINAL</p>
                </div>
                <p className="text-white font-medium">{portoChegada?.nome}</p>
                {nomeMunicipio(portoChegada?.municipioId) && (
                  <p className="text-gray-400 text-sm">{nomeMunicipio(portoChegada?.municipioId)}</p>
                )}
                {portoChegada?.endereco && (
                  <p className="text-gray-400 text-sm">{portoChegada.endereco}</p>
                )}
                {viagem.horarioChegada && (
                  <p className="text-green-400 text-sm font-medium">Chegada prevista: {viagem.horarioChegada}</p>
                )}
                {portoChegada?.possuiPracaAlimentacao && (
                  <p className="text-gray-400 text-xs">Praca de alimentacao disponivel</p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {linkMaps(portoChegada) && (
                    <a href={linkMaps(portoChegada)} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                      Google Maps
                    </a>
                  )}
                  {linkUber(portoChegada) && (
                    <a href={linkUber(portoChegada)} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                      Uber
                    </a>
                  )}
                  {link99(portoChegada) && (
                    <a href={link99(portoChegada)} target="_blank" rel="noopener noreferrer"
                      className="text-xs bg-white/10 text-white px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                      99
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BarcoDetalhes;
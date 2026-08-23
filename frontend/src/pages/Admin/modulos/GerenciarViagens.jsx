import { useState, useEffect } from 'react';
import Button from '../../../components/Button';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

const STATUS_OPCOES = [
  { valor: 'confirmada', rotulo: 'Confirmada', cor: 'text-green-400' },
  { valor: 'a-confirmar', rotulo: 'A Confirmar', cor: 'text-yellow-400' },
  { valor: 'cancelada', rotulo: 'Cancelada', cor: 'text-red-400' },
  { valor: 'extraordinaria', rotulo: 'Viagem Extraordinaria', cor: 'text-purple-400' },
];

const FORM_VAZIO = {
  barcoId: '',
  portoSaidaId: '',
  horarioPartida: '',
  portoChegadaId: '',
  horarioChegada: '',
  dataViagem: '',
  status: 'confirmada',
  paradas: [],
};

const PARADA_VAZIA = { municipioId: '', portoId: '' };

function GerenciarViagens() {
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [listaPortos, setListaPortos] = useState([]);
  const [listaBarcos, setListaBarcos] = useState([]);
  const [listaViagens, setListaViagens] = useState([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const [alterandoStatusId, setAlterandoStatusId] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const carregarMunicipiosDoBanco = () => {
    fetch(`${API_URL}/api/municipios.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) setListaMunicipios(resposta.dados);
      })
      .catch((err) => console.error('Erro ao buscar municípios:', err));
  };

  const carregarPortosDoBanco = () => {
    fetch(`${API_URL}/api/portos.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          const portosFormatados = resposta.dados.map((p) => ({
            id: p.id,
            nome: p.nome,
            municipioId: p.municipio_id,
          }));
          setListaPortos(portosFormatados);
        }
      })
      .catch((err) => console.error('Erro ao buscar portos:', err));
  };

  const carregarBarcosDoBanco = () => {
    fetch(`${API_URL}/api/barcos.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          const barcosFormatados = resposta.dados.map((b) => ({
            ...b,
            capacidadeMaxima: b.capacidade_max,
            horarioPartida: b.horario_partida,
            fotoUrl: b.foto_url,
          }));
          setListaBarcos(barcosFormatados);
        }
      })
      .catch((err) => console.error('Erro ao buscar barcos do MySQL:', err));
  };

  const carregarViagensDoBanco = () => {
    setCarregando(true);
    fetch(`${API_URL}/api/viagens.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          const viagensFormatadas = resposta.dados.map((v) => ({
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
          setErro(resposta.mensagem || 'Erro ao carregar viagens do banco');
        }
      })
      .catch(() => setErro('Erro ao conectar com a API de viagens'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarMunicipiosDoBanco();
    carregarPortosDoBanco();
    carregarBarcosDoBanco();
    carregarViagensDoBanco();
  }, []);

  const handleChange = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const portosDoMunicipio = (municipioId) => {
    return listaPortos.filter((p) => String(p.municipioId) === String(municipioId));
  };

  const adicionarParada = () => {
    setForm((anterior) => ({
      ...anterior,
      paradas: [...anterior.paradas, { ...PARADA_VAZIA, id: Date.now().toString() }],
    }));
  };

  const removerParada = (indice) => {
    setForm((anterior) => ({
      ...anterior,
      paradas: anterior.paradas.filter((_, i) => i !== indice),
    }));
  };

  const handleParada = (indice, campo, valor) => {
    setForm((anterior) => {
      const novasParadas = [...anterior.paradas];
      novasParadas[indice] = { ...novasParadas[indice], [campo]: valor };
      if (campo === 'municipioId') novasParadas[indice].portoId = '';
      return { ...anterior, paradas: novasParadas };
    });
  };
  const handleSalvar = (evento) => {
  evento.preventDefault();

  if (!form.barcoId || !form.portoSaidaId || !form.portoChegadaId || !form.dataViagem) {
    setErro('Preencha os campos obrigatórios na interface.');
    return;
  }

  setErro('');
  const metodo = editandoId ? 'PUT' : 'POST';

  const corpo = {
    ...(editandoId ? { id: editandoId } : {}),
    barcoId: form.barcoId,
    portoSaidaId: form.portoSaidaId,
    horarioPartida: form.horarioPartida,
    portoChegadaId: form.portoChegadaId,
    horarioChegada: form.horarioChegada,
    dataViagem: form.dataViagem,
    status: form.status,
    paradas: form.paradas,
  };

  fetch(`${API_URL}/api/viagens.php`, {
    method: metodo,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
    .then((res) => res.json())
    .then((resposta) => {
      if (resposta.sucesso) {
        setEditandoId(null);
        setForm(FORM_VAZIO);
        setMostrarFormulario(false);
        carregarViagensDoBanco();
      } else {
        setErro(resposta.mensagem || 'Erro da API ao salvar');
      }
    })
    .catch(() => setErro('Erro de conexão ao salvar viagem no banco'));
};

 
    setErro('');
    const metodo = editandoId ? 'PUT' : 'POST';

    const corpo = {
      ...(editandoId ? { id: editandoId } : {}),
      barco_id: form.barcoId,
      porto_saida_id: form.portoSaidaId,
      horario_partida: form.horarioPartida,
      porto_chegada_id: form.portoChegadaId,
      horario_chegada: form.horarioChegada,
      data_viagem: form.dataViagem,
      status: form.status,
      paradas: form.paradas,
    };

    fetch(`${API_URL}/api/viagens.php`, {
      method: metodo,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          setEditandoId(null);
          setForm(FORM_VAZIO);
          setMostrarFormulario(false);
          carregarViagensDoBanco();
        } else {
          setErro(resposta.mensagem || 'Erro da API ao salvar');
        }
      })
      .catch(() => setErro('Erro de conexão ao salvar viagem no banco'));
  };

  const handleEditar = (viagem) => {
    setEditandoId(viagem.id);
    setForm({ ...FORM_VAZIO, ...viagem });
    setMostrarFormulario(true);
    setExpandidoId(null);
    setConfirmarExclusaoId(null);
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setMostrarFormulario(false);
  };

  const handleExcluir = (id) => {
    setErro('');
    fetch(`${API_URL}/api/viagens.php`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((resposta) => {
        setConfirmarExclusaoId(null);
        if (resposta.sucesso) {
          if (editandoId === id) handleCancelar();
          carregarViagensDoBanco();
        } else {
          setErro(resposta.mensagem || 'Erro ao excluir');
        }
      })
      .catch(() => setErro('Erro ao excluir viagem do banco'));
  };

  const handleAlterarStatus = (id, novoStatus) => {
    fetch(`${API_URL}/api/viagens.php`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: novoStatus, somenteStatus: true }),
    })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) carregarViagensDoBanco();
      });
    setAlterandoStatusId(null);
  };

const handleDuplicar = (viagem) => {
  const { id, ...dadosSemId } = viagem;

  const corpoDuplicar = {
    barcoId: dadosSemId.barcoId,
    portoSaidaId: dadosSemId.portoSaidaId,
    horarioPartida: dadosSemId.horarioPartida,
    portoChegadaId: dadosSemId.portoChegadaId,
    horarioChegada: dadosSemId.horarioChegada,
    dataViagem: dadosSemId.dataViagem,
    status: dadosSemId.status,
    paradas: dadosSemId.paradas || [],
  };

  fetch(`${API_URL}/api/viagens.php`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpoDuplicar),
  })
    .then((res) => res.json())
    .then((resposta) => {
      if (resposta.sucesso) carregarViagensDoBanco();
    });
};

  const nomeBarco = (id) => listaBarcos.find((b) => String(b.id) === String(id))?.nome || 'indefinido';
  const nomePorto = (id) => listaPortos.find((p) => String(p.id) === String(id))?.nome || 'indefinido';
  const nomeMunicipio = (id) => listaMunicipios.find((m) => String(m.id) === String(id))?.nome || 'indefinido';

  const rotuloCor = (status) => STATUS_OPCOES.find((s) => s.valor === status) || STATUS_OPCOES[1];
  const podeCriar = listaBarcos.length > 0 && listaPortos.length >= 2;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Gerenciar Viagens</h2>
        {!mostrarFormulario && podeCriar && (
          <Button tipo="primary" tamanho="medium" onClick={() => setMostrarFormulario(true)}>
            Nova viagem
          </Button>
        )}
      </div>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {!podeCriar && !carregando && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4">
          <p className="text-yellow-400 text-sm">
            Cadastre ao menos um barco e dois portos antes de criar viagens.
          </p>
        </div>
      )}

      {mostrarFormulario && (
        <form onSubmit={handleSalvar} className="bg-[#0a2e5c] border border-white/10 rounded-xl p-5 space-y-6">
          <h3 className="text-white font-semibold">
            {editandoId ? 'Editando viagem' : 'Nova viagem'}
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Barco</label>
            <select
              required
              value={form.barcoId}
              onChange={(e) => handleChange('barcoId', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            >
              <option value="">Selecione um barco</option>
              {listaBarcos.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome} ({b.capacidadeMaxima} passageiros)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Data da viagem</label>
            <input
              type="date"
              required
              value={form.dataViagem}
              onChange={(e) => handleChange('dataViagem', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div className="bg-[#041f43]/60 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-[#00D9E9] text-sm font-semibold">Porto de saída</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Porto</label>
                <select
                  required
                  value={form.portoSaidaId}
                  onChange={(e) => handleChange('portoSaidaId', e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
                >
                  <option value="">Selecione</option>
                  {listaPortos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} - {nomeMunicipio(p.municipioId)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Horário de partida</label>
                <input
                  type="time"
                  value={form.horarioPartida}
                  onChange={(e) => handleChange('horarioPartida', e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[#00D9E9] text-sm font-semibold">Paradas intermediárias</p>
              <Button tipo="secondary" tamanho="small" onClick={adicionarParada}>
                + Adicionar parada
              </Button>
            </div>

            {form.paradas.length === 0 && (
              <p className="text-gray-500 text-sm">Nenhuma parada adicionada.</p>
            )}

            {form.paradas.map((parada, indice) => (
              <div key={parada.id || indice} className="bg-[#041f43]/60 border border-white/10 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-gray-300 text-sm font-medium">Parada {indice + 1}</p>
                  <button
                    type="button"
                    onClick={() => removerParada(indice)}
                    className="text-red-400 text-xs hover:text-red-300"
                  >
                    Remover
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Município</label>
                    <select
                      value={parada.municipioId}
                      onChange={(e) => handleParada(indice, 'municipioId', e.target.value)}
                      className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
                    >
                      <option value="">Selecione</option>
                      {listaMunicipios.map((m) => (
                        <option key={m.id} value={m.id}>{m.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Porto</label>
                    <select
                      value={parada.portoId}
                      onChange={(e) => handleParada(indice, 'portoId', e.target.value)}
                      disabled={!parada.municipioId}
                      className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] disabled:opacity-40"
                    >
                      <option value="">Selecione</option>
                      {portosDoMunicipio(parada.municipioId).map((p) => (
                        <option key={p.id} value={p.id}>{p.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#041f43]/60 border border-white/10 rounded-xl p-4 space-y-3">
            <p className="text-[#00D9E9] text-sm font-semibold">Porto de chegada</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Porto</label>
                <select
                  required
                  value={form.portoChegadaId}
                  onChange={(e) => handleChange('portoChegadaId', e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
                >
                  <option value="">Selecione</option>
                  {listaPortos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} - {nomeMunicipio(p.municipioId)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Horário previsto de chegada</label>
                <input
                  type="time"
                  value={form.horarioChegada}
                  onChange={(e) => handleChange('horarioChegada', e.target.value)}
                  className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status da viagem</label>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPCOES.map((opcao) => (
                <button
                  key={opcao.valor}
                  type="button"
                  onClick={() => handleChange('status', opcao.valor)}
                  className={
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                    (form.status === opcao.valor
                      ? 'bg-[#00D9E9] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20')
                  }
                >
                  {opcao.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" tipo="primary" tamanho="medium">
              {editandoId ? 'Salvar edição' : 'Concluir Cadastro'}
            </Button>
            <Button tipo="secondary" tamanho="medium" onClick={handleCancelar}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      {carregando ? (
        <p className="text-gray-500 text-sm">Carregando dados do banco...</p>
      ) : listaViagens.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma viagem cadastrada ainda.</p>
      ) : (
        <ul className="space-y-2">
          {listaViagens.map((viagem) => {
            const statusInfo = rotuloCor(viagem.status);
            return (
              <li
                key={viagem.id}
                className={
                  'bg-[#0a2e5c] border rounded-xl overflow-hidden ' +
                  (editandoId === viagem.id ? 'border-[#00D9E9]/50' : 'border-white/10')
                }
              >
                <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-medium">{nomeBarco(viagem.barcoId)}</p>
                    <p className="text-gray-400 text-sm">
                      {nomePorto(viagem.portoSaidaId)} → {nomePorto(viagem.portoChegadaId)}
                    </p>
                    <p className="text-gray-400 text-sm">{viagem.dataViagem}</p>
                    <span className={'text-xs font-medium ' + statusInfo.cor}>
                      {statusInfo.rotulo}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      tipo="secondary"
                      tamanho="small"
                      onClick={() => setExpandidoId(expandidoId === viagem.id ? null : viagem.id)}
                    >
                      {expandidoId === viagem.id ? 'Fechar' : 'Visualizar'}
                    </Button>

                    <Button tipo="secondary" tamanho="small" onClick={() => handleEditar(viagem)}>
                      Editar
                    </Button>

                    <Button tipo="secondary" tamanho="small" onClick={() => handleDuplicar(viagem)}>
                      Duplicar
                    </Button>

                    {alterandoStatusId === viagem.id ? (
                      <div className="flex gap-1 flex-wrap">
                        {STATUS_OPCOES.map((opcao) => (
                          <button
                            key={opcao.valor}
                            onClick={() => handleAlterarStatus(viagem.id, opcao.valor)}
                            className={'text-xs px-2 py-1 rounded-full ' + opcao.cor + ' bg-white/10 hover:bg-white/20'}
                          >
                            {opcao.rotulo}
                          </button>
                        ))}
                        <button
                          onClick={() => setAlterandoStatusId(null)}
                          className="text-xs px-2 py-1 rounded-full text-gray-400 bg-white/10 hover:bg-white/20"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <Button tipo="secondary" tamanho="small" onClick={() => setAlterandoStatusId(viagem.id)}>
                        Status
                      </Button>
                    )}

                    {confirmarExclusaoId === viagem.id ? (
                      <>
                        <span className="text-red-400 text-sm">Confirmar?</span>
                        <Button tipo="danger" tamanho="small" onClick={() => handleExcluir(viagem.id)}>
                          Excluir
                        </Button>
                        <Button tipo="secondary" tamanho="small" onClick={() => setConfirmarExclusaoId(null)}>
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <Button tipo="danger" tamanho="small" onClick={() => setConfirmarExclusaoId(viagem.id)}>
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>

                {expandidoId === viagem.id && (
                  <div className="border-t border-white/10 px-5 py-4 space-y-3 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p className="text-gray-400">Barco: <span className="text-gray-200">{nomeBarco(viagem.barcoId)}</span></p>
                      <p className="text-gray-400">Data: <span className="text-gray-200">{viagem.dataViagem}</span></p>
                      <p className="text-gray-400">Saída: <span className="text-gray-200">{nomePorto(viagem.portoSaidaId)} {viagem.horarioPartida && '- ' + viagem.horarioPartida}</span></p>
                      <p className="text-gray-400">Chegada: <span className="text-gray-200">{nomePorto(viagem.portoChegadaId)} {viagem.horarioChegada && '- ' + viagem.horarioChegada}</span></p>
                    </div>

                    {viagem.paradas && viagem.paradas.length > 0 && (
                      <div>
                        <p className="text-gray-400 mb-1">Paradas:</p>
                        <ul className="space-y-1">
                          {viagem.paradas.map((parada, i) => (
                            <li key={i} className="text-gray-200 text-xs">
                              Parada {i + 1}: {nomePorto(parada.portoId)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );


export default GerenciarViagens;
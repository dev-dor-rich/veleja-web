import { useState, useEffect } from 'react';
import Button from '../../../components/Button';

const FORM_VAZIO = {
  nome: '',
  municipioId: '',
  endereco: '',
  latitude: '',
  longitude: '',
  tipoEstacionamento: '',
  possuiPracaAlimentacao: false,
  horarioAbertura: '',
  horarioFechamento: '',
};

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

function Portos() {
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [listaPortos, setListaPortos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);

  const carregarMunicipios = () => {
    fetch(`${API_URL}/api/municipios.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) setListaMunicipios(resposta.dados);
      });
  };

  const carregarPortos = () => {
    setCarregando(true);
    fetch(`${API_URL}/api/portos.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          const convertidos = resposta.dados.map((p) => ({
            id: p.id,
            nome: p.nome,
            municipioId: p.municipio_id,
            municipioNome: p.municipio_nome,
            endereco: p.endereco || '',
            latitude: p.latitude,
            longitude: p.longitude,
            tipoEstacionamento: p.tipo_estacionamento || '',
            possuiPracaAlimentacao: p.possui_praca_alimentacao,
            horarioAbertura: p.horario_abertura || '',
            horarioFechamento: p.horario_fechamento || '',
          }));
          setListaPortos(convertidos);
        }
      })
      .catch(() => setErro('Erro ao carregar portos'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarMunicipios();
    carregarPortos();
  }, []);

  const handleChange = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleEditar = (porto) => {
    setEditandoId(porto.id);
    setForm({ ...FORM_VAZIO, ...porto });
    setConfirmarExclusaoId(null);
    setExpandidoId(null);
  };

  const handleSalvar = (evento) => {
    evento.preventDefault();
    if (!form.nome.trim() || !form.municipioId) return;
    setErro('');

    const corpo = {
      ...form,
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      latitude: form.latitude !== '' ? form.latitude : null,
      longitude: form.longitude !== '' ? form.longitude : null,
    };

    const metodo = editandoId ? 'PUT' : 'POST';
    if (editandoId) corpo.id = editandoId;

    fetch(`${API_URL}/api/portos.php`, {
      method: metodo,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          setForm(FORM_VAZIO);
          setEditandoId(null);
          carregarPortos();
        } else {
          setErro(resposta.mensagem || 'Erro ao salvar porto');
        }
      })
      .catch(() => setErro('Erro ao salvar porto'));
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  };

  const handleExcluir = (id) => {
    setErro('');
    fetch(`${API_URL}/api/portos.php`, {
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
          carregarPortos();
        } else {
          setErro(resposta.mensagem || 'Erro ao excluir porto');
        }
      })
      .catch(() => setErro('Erro ao excluir porto'));
  };

  const nomeMunicipio = (municipioId) => {
    const municipio = listaMunicipios.find((m) => m.id === municipioId);
    return municipio ? municipio.nome : 'indefinido';
  };

  const linkMaps = (porto) => {
    if (porto.latitude && porto.longitude) {
      return 'https://www.google.com/maps?q=' + porto.latitude + ',' + porto.longitude;
    }
    if (porto.endereco) {
      return 'https://www.google.com/maps/search/' + encodeURIComponent(porto.endereco);
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Portos</h2>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {listaMunicipios.length === 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4">
          <p className="text-yellow-400 text-sm">
            Cadastre ao menos um municipio antes de adicionar portos.
          </p>
        </div>
      )}

      <form onSubmit={handleSalvar} className="bg-[#0a2e5c] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">
          {editandoId ? 'Editando porto' : 'Novo porto'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do porto</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Porto Souza Sobrinho"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Municipio</label>
            <select
              required
              value={form.municipioId}
              onChange={(e) => handleChange('municipioId', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            >
              <option value="">Selecione</option>
              {listaMunicipios.map((m) => (
                <option key={m.id} value={m.id}>{m.nome}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-1">Endereco</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
              placeholder="Ex: Rodovia Bernardo Sayao, s/n"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Latitude (opcional)</label>
            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => handleChange('latitude', e.target.value)}
              placeholder="Ex: -1.4558"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Longitude (opcional)</label>
            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => handleChange('longitude', e.target.value)}
              placeholder="Ex: -48.5024"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de estacionamento</label>
            <select
              value={form.tipoEstacionamento}
              onChange={(e) => handleChange('tipoEstacionamento', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            >
              <option value="">Selecione</option>
              <option value="Gratuito">Gratuito</option>
              <option value="Rotativo">Rotativo</option>
              <option value="Privativo">Privativo</option>
              <option value="Nao possui">Nao possui</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <input
              id="pracaAlimentacao"
              type="checkbox"
              checked={form.possuiPracaAlimentacao}
              onChange={(e) => handleChange('possuiPracaAlimentacao', e.target.checked)}
              className="w-4 h-4 accent-[#00D9E9]"
            />
            <label htmlFor="pracaAlimentacao" className="text-sm font-medium text-gray-300">
              Possui praca de alimentacao
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Horario de abertura</label>
            <input
              type="time"
              value={form.horarioAbertura}
              onChange={(e) => handleChange('horarioAbertura', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Horario de fechamento</label>
            <input
              type="time"
              value={form.horarioFechamento}
              onChange={(e) => handleChange('horarioFechamento', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" tipo="primary" tamanho="medium">
            {editandoId ? 'Salvar edicao' : 'Cadastrar porto'}
          </Button>
          {editandoId && (
            <Button tipo="secondary" tamanho="medium" onClick={handleCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {carregando ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : listaPortos.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum porto cadastrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {listaPortos.map((porto) => (
            <li
              key={porto.id}
              className={
                'bg-[#0a2e5c] border rounded-xl overflow-hidden ' +
                (editandoId === porto.id ? 'border-[#00D9E9]/50' : 'border-white/10')
              }
            >
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-white font-medium">{porto.nome}</p>
                  <p className="text-gray-400 text-sm">{nomeMunicipio(porto.municipioId)}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {linkMaps(porto) && (
                    <a
                    
                      href={linkMaps(porto)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#00D9E9] hover:underline"
                    >
                      Ver no Maps
                    </a>
                  )}

                  <Button
                    tipo="secondary"
                    tamanho="small"
                    onClick={() => setExpandidoId(expandidoId === porto.id ? null : porto.id)}
                  >
                    {expandidoId === porto.id ? 'Fechar' : 'Detalhes'}
                  </Button>

                  {confirmarExclusaoId === porto.id ? (
                    <>
                      <span className="text-red-400 text-sm">Confirmar?</span>
                      <Button tipo="danger" tamanho="small" onClick={() => handleExcluir(porto.id)}>
                        Excluir
                      </Button>
                      <Button tipo="secondary" tamanho="small" onClick={() => setConfirmarExclusaoId(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button tipo="secondary" tamanho="small" onClick={() => handleEditar(porto)}>
                        Editar
                      </Button>
                      <Button tipo="danger" tamanho="small" onClick={() => setConfirmarExclusaoId(porto.id)}>
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {expandidoId === porto.id && (
                <div className="border-t border-white/10 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-400">Endereco: <span className="text-gray-200">{porto.endereco || 'nao informado'}</span></p>
                  <p className="text-gray-400">Estacionamento: <span className="text-gray-200">{porto.tipoEstacionamento || 'nao informado'}</span></p>
                  <p className="text-gray-400">Praca de alimentacao: <span className="text-gray-200">{porto.possuiPracaAlimentacao ? 'Sim' : 'Nao'}</span></p>
                  <p className="text-gray-400">Funcionamento: <span className="text-gray-200">{porto.horarioAbertura && porto.horarioFechamento ? porto.horarioAbertura + ' ate ' + porto.horarioFechamento : 'nao informado'}</span></p>
                  {porto.latitude && porto.longitude && (
                    <p className="text-gray-400">Coordenadas: <span className="text-gray-200">{porto.latitude}, {porto.longitude}</span></p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Portos;
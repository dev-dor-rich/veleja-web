import { useState, useEffect } from 'react';
import Button from '../../../components/Button';
import useDadosStore from '../../../store/useDadosStore';

const SERVICOS_DISPONIVEIS = ['Rede', 'Camarote', 'Lanchonete', 'Banheiro', 'Ar-condicionado', 'Wi-Fi', 'Outros'];

const FORM_VAZIO = {
  nome: '',
  capacidadeMaxima: '',
  servicos: [],
  horarioPartida: '',
  fotoUrl: null,
};

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

function Barcos() {
  const setListaBarcosStore = useDadosStore((s) => s.setListaBarcos);

  const [listaBarcos, setListaBarcos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [expandidoId, setExpandidoId] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);

  const carregarBarcos = () => {
    setCarregando(true);
    fetch(`${API_URL}/api/barcos.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) {
          // Mapeia os nomes das colunas do banco (snake_case) para camelCase do React
          const barcosFormatados = resposta.dados.map((b) => ({
            ...b,
            capacidadeMaxima: b.capacidadeMaxima ?? b.capacidade_maxima,
            horarioPartida: b.horarioPartida ?? b.horario_partida,
            fotoUrl: b.fotoUrl ?? b.foto_url,
          }));

          setListaBarcos(barcosFormatados);
          if (setListaBarcosStore) {
            setListaBarcosStore(barcosFormatados); // Sincroniza com o Zustand para o BancoDados e GerenciarViagens
          }
        }
      })
      .catch(() => setErro('Erro ao carregar barcos'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarBarcos();
  }, []);

  const handleChange = (campo, valor) => {
    setForm((anterior) => ({ ...anterior, [campo]: valor }));
  };

  const handleServico = (servico) => {
    setForm((anterior) => {
      const jaTemServico = anterior.servicos.includes(servico);
      return {
        ...anterior,
        servicos: jaTemServico
          ? anterior.servicos.filter((s) => s !== servico)
          : [...anterior.servicos, servico],
      };
    });
  };

  const handleFoto = (evento) => {
    const arquivo = evento.target.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e) => {
      const url = e.target.result;
      setPreviewFoto(url);
      setForm((anterior) => ({ ...anterior, fotoUrl: url }));
    };
    leitor.readAsDataURL(arquivo);
  };

  const handleEditar = (barco) => {
    setEditandoId(barco.id);
    setForm({
      nome: barco.nome,
      capacidadeMaxima: String(barco.capacidadeMaxima ?? barco.capacidade_maxima ?? ''),
      servicos: barco.servicos ?? [],
      horarioPartida: barco.horarioPartida ?? barco.horario_partida ?? '',
      fotoUrl: barco.fotoUrl ?? barco.foto_url ?? null,
    });
    setPreviewFoto(barco.fotoUrl || barco.foto_url || null);
    setConfirmarExclusaoId(null);
    setExpandidoId(null);
  };

  const handleSalvar = (evento) => {
    evento.preventDefault();
    if (!form.nome.trim() || !form.capacidadeMaxima) return;
    setErro('');

    const metodo = editandoId ? 'PUT' : 'POST';
    const corpo = {
      ...(editandoId ? { id: editandoId } : {}),
      nome: form.nome.trim(),
      capacidadeMaxima: parseInt(form.capacidadeMaxima, 10),
      servicos: form.servicos,
      horarioPartida: form.horarioPartida || null,
      fotoUrl: form.fotoUrl || null,
    };

    fetch(`${API_URL}/api/barcos.php`, {
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
          setPreviewFoto(null);
          carregarBarcos();
        } else {
          setErro(resposta.mensagem || 'Erro ao salvar');
        }
      })
      .catch(() => setErro('Erro ao salvar barco'));
  };

  const handleCancelar = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
    setPreviewFoto(null);
  };

  const handleExcluir = (id) => {
    setErro('');
    fetch(`${API_URL}/api/barcos.php`, {
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
          carregarBarcos();
        } else {
          setErro(resposta.mensagem || 'Erro ao excluir');
        }
      })
      .catch(() => setErro('Erro ao excluir barco'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Barcos</h2>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm">{erro}</p>
        </div>
      )}

      <form onSubmit={handleSalvar} className="bg-[#0a2e5c] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-white font-semibold">
          {editandoId ? 'Editando barco' : 'Novo barco'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nome do barco</label>
            <input
              type="text"
              required
              value={form.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Estrela do Para"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Capacidade maxima de passageiros</label>
            <input
              type="number"
              required
              min="1"
              value={form.capacidadeMaxima}
              onChange={(e) => handleChange('capacidadeMaxima', e.target.value)}
              placeholder="Ex: 120"
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Horario de partida</label>
            <input
              type="time"
              value={form.horarioPartida}
              onChange={(e) => handleChange('horarioPartida', e.target.value)}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Foto do barco
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFoto}
              className="w-full bg-[#041f43] border border-white/20 text-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] file:mr-3 file:bg-[#00D9E9] file:text-white file:border-0 file:rounded file:px-2 file:py-1 file:text-sm"
            />
            {previewFoto && (
              <img src={previewFoto} alt="Preview" className="mt-2 h-24 rounded-lg object-cover" />
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Servicos oferecidos</label>
            <div className="flex flex-wrap gap-2">
              {SERVICOS_DISPONIVEIS.map((servico) => (
                <button
                  key={servico}
                  type="button"
                  onClick={() => handleServico(servico)}
                  className={
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                    (form.servicos.includes(servico)
                      ? 'bg-[#00D9E9] text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20')
                  }
                >
                  {servico}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="submit" tipo="primary" tamanho="medium">
            {editandoId ? 'Salvar edicao' : 'Cadastrar barco'}
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
      ) : listaBarcos.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum barco cadastrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {listaBarcos.map((barco) => (
            <li
              key={barco.id}
              className={
                'bg-[#0a2e5c] border rounded-xl overflow-hidden ' +
                (editandoId === barco.id ? 'border-[#00D9E9]/50' : 'border-white/10')
              }
            >
              <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  {(barco.fotoUrl || barco.foto_url) ? (
                    <img src={barco.fotoUrl || barco.foto_url} alt={barco.nome} className="h-12 w-16 rounded object-cover" />
                  ) : (
                    <div className="h-12 w-16 rounded bg-gradient-to-br from-[#00D9E9] to-[#2FA89F] flex items-center justify-center text-2xl">
                      <span>&#9975;</span>
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{barco.nome}</p>
                    <p className="text-gray-400 text-sm">{(barco.capacidadeMaxima ?? barco.capacidade_maxima)} passageiros</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    tipo="secondary"
                    tamanho="small"
                    onClick={() => setExpandidoId(expandidoId === barco.id ? null : barco.id)}
                  >
                    {expandidoId === barco.id ? 'Fechar' : 'Detalhes'}
                  </Button>

                  {confirmarExclusaoId === barco.id ? (
                    <>
                      <span className="text-red-400 text-sm">Confirmar?</span>
                      <Button tipo="danger" tamanho="small" onClick={() => handleExcluir(barco.id)}>
                        Excluir
                      </Button>
                      <Button tipo="secondary" tamanho="small" onClick={() => setConfirmarExclusaoId(null)}>
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button tipo="secondary" tamanho="small" onClick={() => handleEditar(barco)}>
                        Editar
                      </Button>
                      <Button tipo="danger" tamanho="small" onClick={() => setConfirmarExclusaoId(barco.id)}>
                        Excluir
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {expandidoId === barco.id && (
                <div className="border-t border-white/10 px-5 py-4 space-y-2 text-sm">
                  <p className="text-gray-400">Horario de partida: <span className="text-gray-200">{(barco.horarioPartida || barco.horario_partida) || 'nao informado'}</span></p>
                  <div>
                    <p className="text-gray-400 mb-1">Servicos:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {barco.servicos && barco.servicos.length > 0 ? (
                        barco.servicos.map((s) => (
                          <span key={s} className="text-xs bg-white/10 text-gray-200 px-2 py-1 rounded-full">{s}</span>
                        ))
                      ) : (
                        <span className="text-gray-500">Nenhum servico cadastrado</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Barcos;
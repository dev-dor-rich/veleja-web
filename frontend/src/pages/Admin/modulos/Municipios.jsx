// Módulo de cadastro de municípios
// O mais simples do sistema — só nome. Serve de base pro dropdown
// de municípios que aparece em Portos e em Gerenciar Viagens

import { useState, useEffect } from 'react';
import Button from '../../../components/Button';

const FORM_VAZIO = { nome: '' };

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? `http://${window.location.hostname}:8000`
  : 'https://veleja-site-production.up.railway.app';

function Municipios() {
  const [listaMunicipios, setListaMunicipios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);
  const [erro, setErro] = useState('');

  // Busca a lista de municípios na API
  const carregarMunicipios = () => {
    setCarregando(true);
    fetch(`${API_URL}/api/municipios.php`, { credentials: 'include' })
      .then((res) => res.json())
      .then((resposta) => {
        if (resposta.sucesso) setListaMunicipios(resposta.dados);
      })
      .catch(() => setErro('Erro ao carregar municípios'))
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregarMunicipios();
  }, []);

  const handleEditar = (municipio) => {
    setEditandoId(municipio.id);
    setForm({ nome: municipio.nome });
    setConfirmarExclusaoId(null);
  };

  const handleSalvar = (evento) => {
    evento.preventDefault();
    if (!form.nome.trim()) return;
    setErro('');

    const metodo = editandoId ? 'PUT' : 'POST';
    const corpo = editandoId
      ? { id: editandoId, nome: form.nome.trim() }
      : { nome: form.nome.trim() };

    fetch(`${API_URL}/api/municipios.php`, {
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
          carregarMunicipios();
        } else {
          setErro(resposta.mensagem || 'Erro ao salvar');
        }
      })
      .catch(() => setErro('Erro ao salvar município'));
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  };

  const handleExcluir = (id) => {
    setErro('');
    fetch(`${API_URL}/api/municipios.php`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((resposta) => {
        setConfirmarExclusaoId(null);
        if (resposta.sucesso) {
          if (editandoId === id) {
            setEditandoId(null);
            setForm(FORM_VAZIO);
          }
          carregarMunicipios();
        } else {
          setErro(resposta.mensagem || 'Erro ao excluir');
        }
      })
      .catch(() => setErro('Erro ao excluir município'));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Municípios</h2>

      {erro && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm">{erro}</p>
        </div>
      )}

      {/* Formulário de cadastro/edição */}
      <form
        onSubmit={handleSalvar}
        className="bg-[#0a2e5c] border border-white/10 rounded-xl p-5 flex flex-col sm:flex-row gap-3 items-end"
      >
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Nome do município
          </label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={(e) => setForm({ nome: e.target.value })}
            placeholder="Ex: Belém"
            className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" tipo="primary" tamanho="medium">
            {editandoId ? 'Salvar edição' : 'Cadastrar'}
          </Button>
          {editandoId && (
            <Button tipo="secondary" tamanho="medium" onClick={handleCancelarEdicao}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      {/* Lista de municípios */}
      {carregando ? (
        <p className="text-gray-500 text-sm">Carregando...</p>
      ) : listaMunicipios.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum município cadastrado ainda.</p>
      ) : (
        <ul className="space-y-2">
          {listaMunicipios.map((municipio) => (
            <li
              key={municipio.id}
              className={`
                bg-[#0a2e5c] border rounded-xl px-5 py-4 flex items-center justify-between gap-4
                ${editandoId === municipio.id ? 'border-[#00D9E9]/50' : 'border-white/10'}
              `}
            >
              <span className="text-white font-medium">{municipio.nome}</span>

              <div className="flex items-center gap-2">
                {confirmarExclusaoId === municipio.id ? (
                  <>
                    <span className="text-red-400 text-sm">Confirmar exclusão?</span>
                    <Button
                      tipo="danger"
                      tamanho="small"
                      onClick={() => handleExcluir(municipio.id)}
                    >
                      Excluir
                    </Button>
                    <Button
                      tipo="secondary"
                      tamanho="small"
                      onClick={() => setConfirmarExclusaoId(null)}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      tipo="secondary"
                      tamanho="small"
                      onClick={() => handleEditar(municipio)}
                    >
                      Editar
                    </Button>
                    <Button
                      tipo="danger"
                      tamanho="small"
                      onClick={() => setConfirmarExclusaoId(municipio.id)}
                    >
                      Excluir
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Municipios;
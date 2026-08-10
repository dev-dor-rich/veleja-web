// Módulo de cadastro de municípios
// O mais simples do sistema — só nome. Serve de base pro dropdown
// de municípios que aparece em Portos e em Gerenciar Viagens

import { useState } from 'react';
import useDadosStore from '../../../store/useDadosStore';
import Button from '../../../components/Button';

// Estado inicial do formulário — facilita o reset depois de salvar
const FORM_VAZIO = { nome: '' };

function Municipios() {
  const listaMunicipios = useDadosStore((s) => s.listaMunicipios);
  const adicionarMunicipio = useDadosStore((s) => s.adicionarMunicipio);
  const editarMunicipio = useDadosStore((s) => s.editarMunicipio);
  const removerMunicipio = useDadosStore((s) => s.removerMunicipio);

  const [form, setForm] = useState(FORM_VAZIO);
  const [editandoId, setEditandoId] = useState(null); // null = modo cadastro
  const [confirmarExclusaoId, setConfirmarExclusaoId] = useState(null);

  // Preenche o formulário com os dados do município a editar
  const handleEditar = (municipio) => {
    setEditandoId(municipio.id);
    setForm({ nome: municipio.nome });
    setConfirmarExclusaoId(null);
  };

  // Salva cadastro ou edição
  const handleSalvar = (evento) => {
    evento.preventDefault();
    if (!form.nome.trim()) return;

    if (editandoId) {
      editarMunicipio(editandoId, { nome: form.nome.trim() });
      setEditandoId(null);
    } else {
      adicionarMunicipio({ nome: form.nome.trim() });
    }

    setForm(FORM_VAZIO);
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  };

  const handleExcluir = (id) => {
    removerMunicipio(id);
    setConfirmarExclusaoId(null);
    if (editandoId === id) {
      setEditandoId(null);
      setForm(FORM_VAZIO);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Municípios</h2>

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
      {listaMunicipios.length === 0 ? (
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
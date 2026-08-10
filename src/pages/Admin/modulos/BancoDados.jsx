import { useState } from 'react';
import useDadosStore from '../../../store/useDadosStore';

const ABAS = [
  { id: 'municipios', rotulo: 'Municipios' },
  { id: 'portos', rotulo: 'Portos' },
  { id: 'barcos', rotulo: 'Barcos' },
  { id: 'viagens', rotulo: 'Viagens' },
];

const STATUS_INFO = {
  'confirmada': { rotulo: 'Confirmada', cor: 'text-green-400' },
  'a-confirmar': { rotulo: 'A Confirmar', cor: 'text-yellow-400' },
  'cancelada': { rotulo: 'Cancelada', cor: 'text-red-400' },
  'extraordinaria': { rotulo: 'Extraordinaria', cor: 'text-purple-400' },
};

function BancoDados() {
  const listaMunicipios = useDadosStore((s) => s.listaMunicipios);
  const listaPortos = useDadosStore((s) => s.listaPortos);
  const listaBarcos = useDadosStore((s) => s.listaBarcos);
  const listaViagens = useDadosStore((s) => s.listaViagens);

  const [abaAtiva, setAbaAtiva] = useState('municipios');
  const [busca, setBusca] = useState('');

  const nomePorto = (id) => listaPortos.find((p) => p.id === id)?.nome || 'indefinido';
  const nomeBarco = (id) => listaBarcos.find((b) => b.id === id)?.nome || 'indefinido';
  const nomeMunicipio = (id) => listaMunicipios.find((m) => m.id === id)?.nome || 'indefinido';

  // Filtra qualquer lista pelo termo de busca (busca em todos os campos string)
  const filtrar = (lista) => {
    if (!busca.trim()) return lista;
    const termo = busca.toLowerCase();
    return lista.filter((item) =>
      Object.values(item).some((valor) =>
        typeof valor === 'string' && valor.toLowerCase().includes(termo)
      )
    );
  };

  // Exporta os dados da aba atual como JSON
  const handleExportar = () => {
    const dados = {
      municipios: listaMunicipios,
      portos: listaPortos,
      barcos: listaBarcos,
      viagens: listaViagens,
    };
    const conteudo = JSON.stringify(dados[abaAtiva], null, 2);
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'veleja-' + abaAtiva + '-' + new Date().toISOString().slice(0, 10) + '.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Contagens pra mostrar nos badges das abas
  const contagens = {
    municipios: listaMunicipios.length,
    portos: listaPortos.length,
    barcos: listaBarcos.length,
    viagens: listaViagens.length,
  };

  const municipiosFiltrados = filtrar(listaMunicipios);
  const portosFiltrados = filtrar(listaPortos);
  const barcosFiltrados = filtrar(listaBarcos);
  const viagensFiltradas = filtrar(listaViagens);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Banco de Dados</h2>
        <p className="text-gray-400 text-sm mt-1">
          Visualize e exporte todos os registros do sistema.
        </p>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ABAS.map((aba) => (
          <button
            key={aba.id}
            onClick={() => { setAbaAtiva(aba.id); setBusca(''); }}
            className={
              'rounded-xl border p-4 text-left transition-colors ' +
              (abaAtiva === aba.id
                ? 'bg-[#00D9E9]/10 border-[#00D9E9]/40'
                : 'bg-[#0a2e5c] border-white/10 hover:border-white/20')
            }
          >
            <p className={'text-2xl font-bold ' + (abaAtiva === aba.id ? 'text-[#00D9E9]' : 'text-white')}>
              {contagens[aba.id]}
            </p>
            <p className="text-gray-400 text-sm">{aba.rotulo}</p>
          </button>
        ))}
      </div>

      {/* Barra de busca + exportar */}
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={'Buscar em ' + ABAS.find((a) => a.id === abaAtiva)?.rotulo + '...'}
          className="flex-1 bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] text-sm"
        />
        <button
          onClick={handleExportar}
          className="text-sm text-[#00D9E9] border border-[#00D9E9]/30 px-4 py-2 rounded-lg hover:bg-[#00D9E9]/10 transition-colors whitespace-nowrap"
        >
          Exportar JSON
        </button>
      </div>

      {/* Conteudo da aba ativa */}
      <div className="bg-[#0a2e5c] border border-white/10 rounded-xl overflow-hidden">

        {/* Municipios */}
        {abaAtiva === 'municipios' && (
          municipiosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">Nenhum registro encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Nome</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {municipiosFiltrados.map((m) => (
                  <tr key={m.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white">{m.nome}</td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{m.id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Portos */}
        {abaAtiva === 'portos' && (
          portosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">Nenhum registro encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Nome</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Municipio</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Estacionamento</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Praca</th>
                </tr>
              </thead>
              <tbody>
                {portosFiltrados.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white">{p.nome}</td>
                    <td className="px-5 py-3 text-gray-300">{nomeMunicipio(p.municipioId)}</td>
                    <td className="px-5 py-3 text-gray-300">{p.tipoEstacionamento || 'indefinido'}</td>
                    <td className="px-5 py-3 text-gray-300">{p.possuiPracaAlimentacao ? 'Sim' : 'Nao'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Barcos */}
        {abaAtiva === 'barcos' && (
          barcosFiltrados.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">Nenhum registro encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Nome</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Capacidade</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Partida</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Servicos</th>
                </tr>
              </thead>
              <tbody>
                {barcosFiltrados.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-5 py-3 text-white">{b.nome}</td>
                    <td className="px-5 py-3 text-gray-300">{b.capacidadeMaxima} pax</td>
                    <td className="px-5 py-3 text-gray-300">{b.horarioPartida || 'indefinido'}</td>
                    <td className="px-5 py-3 text-gray-300">{b.servicos?.join(', ') || 'nenhum'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        )}

        {/* Viagens */}
        {abaAtiva === 'viagens' && (
          viagensFiltradas.length === 0 ? (
            <p className="text-gray-500 text-sm p-5">Nenhum registro encontrado.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Barco</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Rota</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Data</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Status</th>
                  <th className="text-left text-gray-400 font-medium px-5 py-3">Paradas</th>
                </tr>
              </thead>
              <tbody>
                {viagensFiltradas.map((v) => {
                  const info = STATUS_INFO[v.status] || STATUS_INFO['a-confirmar'];
                  return (
                    <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-5 py-3 text-white">{nomeBarco(v.barcoId)}</td>
                      <td className="px-5 py-3 text-gray-300">
                        {nomePorto(v.portoSaidaId)} → {nomePorto(v.portoChegadaId)}
                      </td>
                      <td className="px-5 py-3 text-gray-300">{v.dataViagem}</td>
                      <td className={'px-5 py-3 font-medium ' + info.cor}>{info.rotulo}</td>
                      <td className="px-5 py-3 text-gray-300">{v.paradas?.length || 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>
  );
}

export default BancoDados;

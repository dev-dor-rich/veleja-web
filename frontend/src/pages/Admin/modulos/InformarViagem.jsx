import { useState } from 'react';
import useDadosStore from '../../../store/useDadosStore';

const STATUS_OPCOES = [
  { valor: 'confirmada', rotulo: 'Confirmada', cor: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30' },
  { valor: 'a-confirmar', rotulo: 'A Confirmar', cor: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  { valor: 'cancelada', rotulo: 'Cancelada', cor: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
  { valor: 'extraordinaria', rotulo: 'Viagem Extraordinaria', cor: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30' },
];

function InformarViagem() {
  const listaViagens = useDadosStore((s) => s.listaViagens);
  const listaBarcos = useDadosStore((s) => s.listaBarcos);
  const listaPortos = useDadosStore((s) => s.listaPortos);
  const alterarStatusViagem = useDadosStore((s) => s.alterarStatusViagem);

  const [alterandoId, setAlterandoId] = useState(null);

  const nomeBarco = (id) => listaBarcos.find((b) => b.id === id)?.nome || 'indefinido';
  const nomePorto = (id) => listaPortos.find((p) => p.id === id)?.nome || 'indefinido';
  const statusInfo = (status) => STATUS_OPCOES.find((s) => s.valor === status) || STATUS_OPCOES[1];

  const handleAlterarStatus = (viagemId, novoStatus) => {
    alterarStatusViagem(viagemId, novoStatus);
    setAlterandoId(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Informar Viagem</h2>
        <p className="text-gray-400 text-sm mt-1">
          Altere rapidamente o status operacional de uma viagem.
        </p>
      </div>

      {listaViagens.length === 0 ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-5 py-4">
          <p className="text-yellow-400 text-sm">
            Nenhuma viagem cadastrada ainda. Crie viagens em Gerenciar Viagens primeiro.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {listaViagens.map((viagem) => {
            const info = statusInfo(viagem.status);
            const estaAlterando = alterandoId === viagem.id;

            return (
              <li
                key={viagem.id}
                className="bg-[#0a2e5c] border border-white/10 rounded-xl px-5 py-4 space-y-3"
              >
                {/* Cabecalho da viagem */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-white font-medium">{nomeBarco(viagem.barcoId)}</p>
                    <p className="text-gray-400 text-sm">
                      {nomePorto(viagem.portoSaidaId)} → {nomePorto(viagem.portoChegadaId)}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">{viagem.dataViagem}</p>
                  </div>

                  {/* Badge de status atual */}
                  <span className={'text-xs font-semibold px-3 py-1 rounded-full border ' + info.cor + ' ' + info.bg}>
                    {info.rotulo}
                  </span>
                </div>

                {/* Botoes de status */}
                {estaAlterando ? (
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">Selecione o novo status:</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_OPCOES.map((opcao) => (
                        <button
                          key={opcao.valor}
                          onClick={() => handleAlterarStatus(viagem.id, opcao.valor)}
                          disabled={opcao.valor === viagem.status}
                          className={
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ' +
                            opcao.cor + ' ' +
                            (opcao.valor === viagem.status
                              ? opcao.bg + ' opacity-50 cursor-not-allowed'
                              : 'bg-white/5 border-white/20 hover:' + opcao.bg)
                          }
                        >
                          {opcao.rotulo}
                          {opcao.valor === viagem.status && ' (atual)'}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setAlterandoId(null)}
                      className="text-xs text-gray-500 hover:text-gray-300"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setAlterandoId(viagem.id)}
                    className="text-xs text-[#00D9E9] hover:underline"
                  >
                    Alterar status
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default InformarViagem;

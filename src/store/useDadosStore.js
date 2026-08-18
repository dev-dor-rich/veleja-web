// Store de dados compartilhados da área administrativa
// Funciona como um "banco de dados simulado" no navegador enquanto o
// backend Flask não existe — cada action aqui vai virar uma chamada de
// API no futuro (mesmo padrão do autenticar() em useStore.js)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Gera um id simples baseado em timestamp — suficiente pra fase mock;
// o backend real vai usar autoincrement do SQLite
const gerarId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const useDadosStore = create(
  persist(
    (set, get) => ({
      // ===== ESTADOS =====
      listaMunicipios: [],
      listaPortos: [],
      listaBarcos: [],
      listaViagens: [],

      // ===== MUNICÍPIOS =====
      adicionarMunicipio: (dados) => {
        const novoMunicipio = { id: gerarId(), ...dados };
        set((estado) => ({ listaMunicipios: [...estado.listaMunicipios, novoMunicipio] }));
        return novoMunicipio;
      },
      editarMunicipio: (id, dados) => {
        set((estado) => ({
          listaMunicipios: estado.listaMunicipios.map((municipio) =>
            municipio.id === id ? { ...municipio, ...dados } : municipio
          ),
        }));
      },
      removerMunicipio: (id) => {
        set((estado) => ({
          listaMunicipios: estado.listaMunicipios.filter((municipio) => municipio.id !== id),
        }));
      },

      // ===== PORTOS =====
      // Cada porto pertence a UM município (municipioId). A "lista de portos
      // de um município" é sempre calculada por filtro dentro do componente
      // que precisar dela (listaPortos.filter(p => p.municipioId === id)) —
      // nunca guardada duas vezes, pra não desincronizar
      adicionarPorto: (dados) => {
        const novoPorto = { id: gerarId(), ...dados };
        set((estado) => ({ listaPortos: [...estado.listaPortos, novoPorto] }));
        return novoPorto;
      },
      editarPorto: (id, dados) => {
        set((estado) => ({
          listaPortos: estado.listaPortos.map((porto) =>
            porto.id === id ? { ...porto, ...dados } : porto
          ),
        }));
      },
      removerPorto: (id) => {
        set((estado) => ({
          listaPortos: estado.listaPortos.filter((porto) => porto.id !== id),
        }));
      },

      // ===== BARCOS =====
      adicionarBarco: (dados) => {
        const novoBarco = { id: gerarId(), ...dados };
        set((estado) => ({ listaBarcos: [...estado.listaBarcos, novoBarco] }));
        return novoBarco;
      },
      editarBarco: (id, dados) => {
        set((estado) => ({
          listaBarcos: estado.listaBarcos.map((barco) =>
            barco.id === id ? { ...barco, ...dados } : barco
          ),
        }));
      },
      removerBarco: (id) => {
        set((estado) => ({
          listaBarcos: estado.listaBarcos.filter((barco) => barco.id !== id),
          listaViagens: estado.listaViagens.filter((viagem) => viagem.barcoId !== id),
        }));
      },

      // ===== VIAGENS =====
      adicionarViagem: (dados) => {
        const novaViagem = {
          id: gerarId(),
          status: 'a-confirmar',
          paradas: [],
          criadaEm: new Date().toISOString(),
          ...dados,
        };
        set((estado) => ({ listaViagens: [...estado.listaViagens, novaViagem] }));
        return novaViagem;
      },
      editarViagem: (id, dados) => {
        set((estado) => ({
          listaViagens: estado.listaViagens.map((viagem) =>
            viagem.id === id ? { ...viagem, ...dados } : viagem
          ),
        }));
      },
      removerViagem: (id) => {
        set((estado) => ({
          listaViagens: estado.listaViagens.filter((viagem) => viagem.id !== id),
        }));
      },
      duplicarViagem: (id) => {
        const original = get().listaViagens.find((viagem) => viagem.id === id);
        if (!original) return null;
        const copia = {
          ...original,
          id: gerarId(),
          status: 'a-confirmar',
          criadaEm: new Date().toISOString(),
        };
        set((estado) => ({ listaViagens: [...estado.listaViagens, copia] }));
        return copia;
      },
      alterarStatusViagem: (id, novoStatus) => {
        set((estado) => ({
          listaViagens: estado.listaViagens.map((viagem) =>
            viagem.id === id ? { ...viagem, status: novoStatus } : viagem
          ),
        }));
      },
    }),
    {
      name: 'veleja-dados',
      // Fotos de barco (fotoUrl) ficam de fora da persistência — arquivo de
      // imagem em base64 estoura o limite de 5MB do localStorage rápido.
      // Some ao recarregar por enquanto; resolve quando o upload for pro backend.
      partialize: (estado) => ({
        listaMunicipios: estado.listaMunicipios,
        listaPortos: estado.listaPortos,
        listaBarcos: estado.listaBarcos.map(({ fotoUrl, ...resto }) => resto),
        listaViagens: estado.listaViagens,
      }),
    }
  )
);

export default useDadosStore;
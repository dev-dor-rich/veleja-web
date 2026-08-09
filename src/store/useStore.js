// Store global da aplicação Veleja (Zustand)
// Gerencia autenticação do administrador e estados de carregamento/erro

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // ===== ESTADOS =====
      usuarioAutenticado: false,
      usuarioAdmin: null, // { id, email, nome }
      carregando: false,
      mensagemErro: null,

      // ===== ACTIONS =====

      // Autentica o administrador
      // Por enquanto é uma simulação (mock) — quando o backend Flask
      // estiver pronto, troca o bloco try por uma chamada real à API
      autenticar: async (email, senha) => {
        set({ carregando: true, mensagemErro: null });

        if (!email || !senha) {
          set({ carregando: false, mensagemErro: 'Preencha e-mail e senha.' });
          return false;
        }

        try {
          // TODO: substituir por: const resposta = await api.post('/login', { email, senha })
          const usuarioSimulado = { id: 1, email, nome: 'Administrador' };

          set({
            usuarioAutenticado: true,
            usuarioAdmin: usuarioSimulado,
            carregando: false,
            mensagemErro: null,
          });

          return true;
        } catch (erro) {
          set({ carregando: false, mensagemErro: 'E-mail ou senha inválidos.' });
          return false;
        }
      },

      // Encerra a sessão do administrador
      logout: () => {
        set({ usuarioAutenticado: false, usuarioAdmin: null, mensagemErro: null });
      },

      definirCarregando: (valor) => set({ carregando: valor }),
      definirErro: (mensagem) => set({ mensagemErro: mensagem }),
    }),
    {
      name: 'veleja-auth', // chave usada no localStorage
      partialize: (estado) => ({
        usuarioAutenticado: estado.usuarioAutenticado,
        usuarioAdmin: estado.usuarioAdmin,
      }),
    }
  )
);

export default useStore;
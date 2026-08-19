import { create } from 'zustand';

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://veleja.com.br';

const useStore = create((set) => ({
  // Estado
  admin: null,
  autenticado: false,
  carregando: false,
  mensagemErro: '',

  // Limpar mensagem de erro
  limparErro: () => set({ mensagemErro: '' }),

  // Fazer login
  autenticar: async (email, senha) => {
    set({ carregando: true, mensagemErro: '' });

    try {
      const response = await fetch(`${API_URL}/api/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
        credentials: 'include', // Importante: enviar cookies
      });

      if (!response.ok) {
        set({
          mensagemErro: 'Erro no servidor (HTTP ' + response.status + '). Verifique se o PHP e o MySQL estão configurados.',
          carregando: false,
        });
        return false;
      }

      const dados = await response.json();

      if (dados.sucesso) {
        set({
          autenticado: true,
          admin: { email },
          carregando: false,
        });
        return true;
      } else {
        set({
          mensagemErro: dados.mensagem || 'Erro ao fazer login',
          carregando: false,
        });
        return false;
      }
    } catch (erro) {
      set({
        mensagemErro: 'Não foi possível conectar ao servidor. Verifique se o PHP está rodando em ' + API_URL,
        carregando: false,
      });
      console.error('Erro na autenticação:', erro);
      return false;
    }
  },

  // Verificar se está autenticado (chamar ao carregar a página)
  verificarAutenticacao: async () => {
    try {
      const response = await fetch(`${API_URL}/api/verificar_auth.php`, {
        method: 'GET',
        credentials: 'include',
      });

      const dados = await response.json();

      if (dados.autenticado) {
        set({
          autenticado: true,
          admin: { email: dados.admin_email },
        });
        return true;
      } else {
        set({
          autenticado: false,
          admin: null,
        });
        return false;
      }
    } catch (erro) {
      console.error('Erro ao verificar autenticação:', erro);
      set({ autenticado: false, admin: null });
      return false;
    }
  },

  // Fazer logout
  logout: async () => {
    try {
      await fetch(`${API_URL}/api/logout.php`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
    }

    set({
      autenticado: false,
      admin: null,
      mensagemErro: '',
    });
  },
}));

export default useStore;
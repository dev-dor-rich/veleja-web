// Página de login do administrador
// Conecta com o backend PHP para autenticação segura

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../../store/useStore';
import Button from '../../components/Button';
import logo from '../../assets/logo.svg';

function LoginAdmin() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const autenticar = useStore((estado) => estado.autenticar);
  const carregando = useStore((estado) => estado.carregando);
  const mensagemErro = useStore((estado) => estado.mensagemErro);
  const navegar = useNavigate();

  const handleSubmit = async (evento) => {
    evento.preventDefault();

    const sucesso = await autenticar(email, senha);

    if (sucesso) {
      setEmail('');
      setSenha('');
      navegar('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-[#0a2e5c] border border-white/10 rounded-xl shadow-sm p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="Veleja" className="h-[80px] mb-3" />
          <h1 className="text-xl font-bold text-white">
            Login Administrador
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              disabled={carregando}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] disabled:opacity-50"
              placeholder="admin@veleja.com"
            />
          </div>

          <div>
            <label htmlFor="senha" className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              value={senha}
              onChange={(evento) => setSenha(evento.target.value)}
              disabled={carregando}
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9] disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>

          {mensagemErro && (
            <div className="bg-red-500/20 border border-red-500 text-red-300 text-sm rounded-lg px-3 py-2">
              {mensagemErro}
            </div>
          )}

          <Button 
            type="submit" 
            tipo="primary" 
            tamanho="medium" 
            disabled={carregando}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Apenas admins têm acesso a esta área
        </p>
      </div>
    </div>
  );
}

export default LoginAdmin;
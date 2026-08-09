// Página de login do administrador
// Não há cadastro por aqui de propósito — você adiciona os logins
// manualmente no banco de dados

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
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
              placeholder="seuemail@veleja.com"
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
              className="w-full bg-[#041f43] border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#00D9E9]"
              placeholder="••••••••"
            />
          </div>

          {mensagemErro && (
            <p className="text-red-400 text-sm">{mensagemErro}</p>
          )}

          <Button type="submit" tipo="primary" tamanho="medium" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin;
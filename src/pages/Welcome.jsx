// Página inicial da aplicação Veleja
// Foco total no CTA público — o acesso administrativo vive no Footer global

import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import logo from '../assets/logo.svg';

function Welcome() {
  const navegar = useNavigate();

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="flex flex-col items-center text-center max-w-md">
        <img src={logo} alt="Veleja" className="h-[350px] mb-6 animate-maresia" />

        <h1 className="text-3xl font-bold text-white mb-2">
          Bem-vindo a bordo
        </h1>
        <p className="text-gray-300 mb-8">
          Descubra barcos e rotas no Pará
        </p>

        <Button tipo="primary" tamanho="large" onClick={() => navegar('/vamos-la')}>
          Avançar
        </Button>
      </div>
    </div>
  );
}

export default Welcome;
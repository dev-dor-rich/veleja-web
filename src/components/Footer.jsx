// Rodapé global da aplicação Veleja
// Contém o acesso administrativo — discreto de propósito, visível em
// qualquer página do site, mas sem competir com o conteúdo principal

import { useNavigate } from 'react-router-dom';

function Footer() {
  const navegar = useNavigate();

  return (
    <footer className="px-4 py-4 flex justify-center">
      <button
        onClick={() => navegar('/admin/login')}
        className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
      >
        Acesso administrativo
      </button>
    </footer>
  );
}

export default Footer;
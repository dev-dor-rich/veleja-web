// Componente para proteger rotas que precisam de autenticação

import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

function ProtectedRoute({ children }) {
  const autenticado = useStore((estado) => estado.autenticado);

  if (!autenticado) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
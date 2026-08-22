import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';

import Header from './components/Header';
import Footer from './components/Footer';
import Welcome from './pages/Welcome';
import LoginAdmin from './pages/Admin/LoginAdmin';
import Dashboard from './pages/Admin/Dashboard';
import VamosLa from './pages/Publica/VamosLa';
import BarcoDetalhes from './pages/Publica/BarcoDetalhes';

// Protege rotas que só o administrador autenticado pode acessar.
// Se não estiver autenticado, redireciona pra tela de login.
function RotaProtegida({ children }) {
  const autenticado = useStore((estado) => estado.autenticado);

  if (!autenticado) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/admin/login" element={<LoginAdmin />} />
        <Route
          path="/admin/dashboard"
          element={
            <RotaProtegida>
              <Dashboard />
            </RotaProtegida>
          }
        />
        <Route path="/vamos-la" element={<VamosLa />} />
        <Route path="/viagem/:id" element={<BarcoDetalhes />} /> 
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
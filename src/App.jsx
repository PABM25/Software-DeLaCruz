import { Routes, Route } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './components/NavBar';
import Sidebar from './components/SideBar';
import Dashboard from './pages/Dashboard';
import RegistroPecheras from './pages/registropecheras';
import Login from './pages/login';
import RegistroEmp from './pages/registroempresa';
import Empresa from './pages/empresa';
import Pechera from './pages/datopechera';
import RegistroUsuarios from './pages/registrousuarios';
import DashboardEmpresa from './pages/dashboardempresa';
import Modificarempresa from './pages/modificarempresa';
import ModificarUsuario from './pages/ModificarUsuario';
import Usuarios from './pages/Usuarios';
import ModificarPecheras from './pages/ModificarPecheras';
import ModificarPecherasSinLeer from './pages/ModificarPecherasSinLeer';
import Lavado from './pages/Lavado';
import EcoVista from './pages/EcoVista';
import DistribucionPecheras from './pages/DistribucionPecheras';
import EliminarPechera from './pages/EliminarPechera';
import InfoPechera from './pages/InfoPechera';

import { AuthProvider } from './context/AuthContext.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';


const App = () => {
  return (
    <div className="App">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/registropecheras" element={<PrivateRoute element={<RegistroPecheras />} />} />
          <Route path="/registroempresa" element={<PrivateRoute element={<RegistroEmp />} />} />
          <Route path="/empresa" element={<PrivateRoute element={<Empresa />} />} />
          <Route path="/datopecheras" element={<PrivateRoute element={<Pechera />} />} />
          <Route path="/registrousuarios" element={<PrivateRoute element={<RegistroUsuarios />} />} />
          <Route path="/dashboardempresa" element={<PrivateRoute element={<DashboardEmpresa />} />} />
          <Route path="/modificarempresa/:id_planta" element={<PrivateRoute element={<Modificarempresa />} />} />
          <Route path="/modificarusuario/:id_login" element={<PrivateRoute element={<ModificarUsuario />} />} />
          <Route path="/usuarios" element={<PrivateRoute element={<Usuarios />} />} />
          <Route path="/modificarpecheras" element={<PrivateRoute element={<ModificarPecheras />} />} />
          <Route path="/ModificarPecherasSinLeer/:id_pechera_registro" element={<PrivateRoute element={<ModificarPecherasSinLeer />} />} />
          <Route path="/lavado" element={<PrivateRoute element={<Lavado />} />} />
          <Route path="/ecovista" element={<PrivateRoute element={<EcoVista />} />} />
          <Route path="/distribucion" element={<PrivateRoute  element={<DistribucionPecheras />} />} />
          <Route path="/EliminarPechera" element={<PrivateRoute  element={<EliminarPechera />}  />} />
          <Route path="/InfoPecheras" element={<PrivateRoute  element={<InfoPechera/>} />} />

        </Routes>
      </AuthProvider>
    </div>
  );
};

export default App;

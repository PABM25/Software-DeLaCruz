//Este codigo solo tiene como función tomar la estructura para crear un page

import React from 'react';
import { useNavigate } from 'react-router-dom'; // Asegúrate de importar desde 'react-router-dom'
// import '../../styles/dashboard.css'; IMPORTAR ESTILO
import Navbar from '../../components/navBar';

const HomePage = () => {
  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <p>This is the main content of the home page.</p>
    </div>
  );
};

export default HomePage;
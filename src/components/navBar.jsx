import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import Sidebar from "./SideBar";
import "../styles/nav-bar.css";
import Logo from "../resources/logo2.ico";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  const { logout, user } = useAuth(); // Obtén el usuario del contexto
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [usuarioData, setUsuarioData] = useState(null); // Cambié a un solo usuario
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3000/api/Usuarios')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Error al obtener los datos de usuario');
        }
        return response.json();
      })
      .then((data) => {
        // Filtra el usuario logueado
        const loggedUser = data.find(u => u.correo === user.email); // Cambia `correo` según tu estructura de datos
        setUsuarioData(loggedUser); // Guarda solo el usuario autenticado
      })
      .catch((error) => console.error('Error en la solicitud:', error));
  }, [user]); // Añade `user` como dependencia

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <img id="logo-d" src={Logo} alt="Logo" onClick={handleLogoClick} />
        <h1 className="Logo" onClick={handleLogoClick}>
          DeLaCruz Lavandería
        </h1>
      </div>

      <div className="profile-container">
        <svg
          id="person"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          className="bi bi-person-circle"
          viewBox="0 0 16 16"
          onClick={toggleDropdown}
        >
          <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
          <path
            fillRule="evenodd"
            d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1"
          />
        </svg>

        <div
          className={`profile-menu ${isDropdownOpen ? "show" : ""}`}
          onMouseLeave={closeDropdown}
        >
          {usuarioData && ( // Asegúrate de que hay datos del usuario
            <div>
              <p>Usuario</p>
              <p>Nombre: {usuarioData.nombre_completo}</p>
              <p>Empresa: {usuarioData.nombre_planta}</p>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-danger">
            <FontAwesomeIcon icon={faSignOutAlt} /> Cerrar sesión
          </button>
        </div>
      </div>

      <Sidebar isOpen={isMenuOpen} closeSidebar={() => setIsMenuOpen(false)} />
    </header>
  );
};

export default Navbar;

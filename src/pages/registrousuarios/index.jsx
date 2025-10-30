import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../styles/registro-usuarios.css';
import '../../styles/base.css';
import Navbar from '../../components/NavBar';
import Sidebar from '../../components/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons'; // Importa el ícono faPlus

const RegistroUsuarios = () => {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState([]);
  
  const [userData, setUserData] = useState({
    nombre_completo: '',
    correo: '',
    contraseña: '',
    id_planta: '',
    showPassword: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const validar = () => {
    let valid = true;
    let errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userData.nombre_completo) {
      errors.nombre_completo = "El nombre completo es obligatorio";
      valid = false;
    }
    if (!userData.correo) {
      errors.correo = "El correo electrónico es obligatorio";
      valid = false;
    } else if (!emailRegex.test(userData.correo)) {
      errors.correo = "El correo electrónico no es válido";
      valid = false;
    }
    if (!userData.contraseña) {
      errors.contraseña = "La contraseña es obligatoria";
      valid = false;
    }
    if (!userData.id_planta) {
      errors.id_planta = "La empresa a la que pertenece es obligatoria";
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  useEffect(() => {
    fetch('http://localhost:3000/api/centrodetrabajo')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Error al obtener los datos de planta');
            }
            return response.json();   
        })
        .then((data) => setEmpresas(data))   
        .catch((error) => console.error('Error en la solicitud:', error));
  }, []);

  const handleCopy = (event) => {
    event.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validar()) {
      try {
        const response = await fetch('http://localhost:3000/api/registrousuarios', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        if (response.ok) {
          alert('Registro exitoso');
          navigate('/usuarios');  
        } else {
          alert('No se pudo ingresar el usuario');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar el usuario');
      }
    }
  };

  return (
    <div>
      <Navbar />
      <Sidebar />
      <h2 className="text-center mb-4">Registro de Usuario</h2>
      <div className="container">
        <div className="card">
          <div className="card-body">

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo:</label>
                <input
                  type="text"
                  className="form-control"
                  name="nombre_completo"
                  value={userData.nombre_completo}
                  onChange={handleChange}
                />
                {errors.nombre_completo && <p className="text-danger">{errors.nombre_completo}</p>}
              </div>
              <div className="form-group">
                <label>Correo:</label>
                <input
                  type="email"
                  className="form-control"
                  name="correo"
                  value={userData.correo}
                  onChange={handleChange}
                />
                {errors.correo && <p className="text-danger">{errors.correo}</p>}
              </div>
              <div className="form-group position-relative">
                <label>Contraseña:</label>
                <input
                  type="text"
                  className="form-control"
                  name="contraseña"
                  value={userData.contraseña}
                  onChange={handleChange}
                  autoComplete="off"
                  onCopy={handleCopy}
                  onCut={handleCopy}
                  onPaste={handleCopy}
                />
                {errors.contraseña && <p className="text-danger">{errors.contraseña}</p>}
              </div>
              <div className="form-group">
                <label>Centro de trabajo:</label>
                <select
                  className="form-select"
                  name="id_planta"
                  value={userData.id_planta}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un centro</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id_planta} value={empresa.id_planta}>
                      {empresa.nombre_planta}
                    </option>
                  ))}
                </select>
                {errors.nombre_planta && <p className="text-danger">{errors.nombre_planta}</p>}
              </div>
                            
              <div className="boton-submit">
                <button type="submit" className="btn btn-primary">
                  <FontAwesomeIcon icon={faUserPlus} /> Registrar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistroUsuarios;

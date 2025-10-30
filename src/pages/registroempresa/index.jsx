import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/registro-empresa.css"; // Importar estilo
import Navbar from "../../components/NavBar"; // Importar el componente Navbar
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faPlus } from '@fortawesome/free-solid-svg-icons'; // O el ícono que prefieras


const RegistroEmp = () => {
  const navigate = useNavigate();

  const [empresa, setEmpresa] = useState({
    nombre_planta: "",
    cantidad_asignada: "",
    kilos: "",
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    setEmpresa({
      ...empresa,
      [e.target.name]: e.target.value,
    });
  };

  const validar = () => {
    let valid = true;
    let errores = {};

    if (!empresa.nombre_planta) {
      errores.nombre_planta = "El nombre de la empresa es obligatorio";
      valid = false;
    }
    if (!empresa.cantidad_asignada) {
      errores.direccion = "La cantidad de pecheras es obligatoria";
      valid = false;
    }
    if (!empresa.kilos) {
      errores.kilos = "La cantidad de kilos es obligatoria";
      valid = false;
    }

    setErrores(errores);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validar()) {
      try {
        const response = await fetch('http://localhost:3000/api/registroempresa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(empresa),
        });

        if (response.ok) {
          alert('Registro exitoso');
          navigate('/empresa');
        } else {
          alert('Error al registrar la empresa');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error al registrar la empresa');
      }
    }
  };




  return (
    <div>
      <Navbar /> {/* Componente Navbar */}
      <h2 className='tit-registro-emp'>Registro de Empresa</h2>
      <div className="container" id='cont-regis-emp'>
        <form onSubmit={handleSubmit} className='form-emp'>
          <div className='div-emp'>
            <label className='label-emp'>Nombre de la Empresa:</label>
            <input className='input-emp'
              type="text"
              name="nombre_planta"
              value={empresa.nombre_planta}
              onChange={handleChange}
            />
            {errores.nombre_planta &&
              <p style={{ color: "red" }}>{errores.nombre_planta}</p>}
          </div>
          <div>
            <label className='label-emp'>Cantidad de pecheras solicitadas:</label>
            <input className='input-emp'
              type="number"
              name="cantidad_asignada"
              value={empresa.cantidad_asignada}
              onChange={handleChange}
            />
            {errores.cantidad_asignada && (
              <p style={{ color: "red" }}>{errores.cantidad_asignada}</p>
            )}
          </div>
          <div>
            <label className='label-emp'>kilos:</label>
            <input className='input-emp'
              type="number"
              name="kilos"
              value={empresa.kilos}
              onChange={handleChange}
            />
            {errores.kilos &&
              <p className='p-emp' style={{ color: "red" }}>{errores.kilos}</p>}
          </div>
          <button className='boton-reg-emp' type="submit">
            <FontAwesomeIcon icon={faPlus} /> Registrar Empresa
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistroEmp;

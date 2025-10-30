import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/usuario.css';
import '../../styles/base.css';
import Navbar from '../../components/NavBar';
import Sidebar from '../../components/SideBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

const Usuarios = () => {
    const [Usuario, setUsuario] = useState([]);
    const modificarusuario = (id) => {
        console.log("ID seleccionado:", id);
        const usuarioseleccionado = Usuario.find((usuario) => usuario.id_login === id);
    
        if (usuarioseleccionado) {
            console.log("Usuario seleccionado:", usuarioseleccionado);
            
            navigate(`/ModificarUsuario/${id}`);
        } else {
            console.error("No se encontró el usuario");
        }
    };
    useEffect(() => {
        fetch('http://localhost:3000/api/Usuarios')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al obtener los datos de usuario');
                }
                return response.json();   
            })
            .then((data) => setUsuario(data))   
            .catch((error) => console.error('Error en la solicitud:', error));
    }, []);

  

    // Función para eliminar un usuario
    
    const eliminarUsuario = (id) => {
        const usuarioSeleccionado = Usuario.find((usuario) => usuario.id_login === id);  // Busca el usuario correcto
        const confirmacion = window.confirm(`¿Estás seguro de que deseas eliminar a ${usuarioSeleccionado?.nombre_completo} de la empresa ${usuarioSeleccionado?.nombre_planta}?`);
        
        if (confirmacion) {
            fetch(`http://localhost:3000/api/eliminarusuarios/${id}`, {  // Asegúrate de que la URL es correcta
                method: 'DELETE',
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Error al eliminar el usuario');
                }
                return response.json();
            })
            .then(() => {
                setUsuario(Usuario.filter((usuario) => usuario.id_login !== id));  // Actualiza la lista en el frontend
            })
            .catch((error) => console.error('Error:', error));
        }
    };
    

    const navigate = useNavigate();

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div>
            <Navbar />
            <Sidebar />
            <div className='container' id="cabecera-us">
                    <h2 className="titulo-lav">Usuarios</h2>
                    <button id='Agregar-us' onClick={() => handleNavigation('/registrousuarios')}>
                    <FontAwesomeIcon icon={faUserPlus} /> Agregar usuario</button>
                <table className='table-usuario'>
                    <thead>
                        <tr>
                            <th>Nombre completo</th>
                            <th>Correo</th>
                            <th>Empresa</th>
                            <th>EDITAR</th>
                            <th>ELIMINAR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Usuario.map((usuario) => (
                            <tr key={usuario.id_login}>
                                <td>{usuario.nombre_completo}</td>
                                <td>{usuario.correo}</td>
                                <td>{usuario.nombre_planta}/{usuario.estado}</td>
                                <td>
                                    <button
                                        className="btn mod"
                                        onClick={() => modificarusuario(usuario.id_login)}>
                                        Modificar
                                    </button>
                                </td>
                                <td>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => eliminarUsuario(usuario.id_login)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Usuarios;

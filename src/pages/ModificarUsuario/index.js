import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/modificar-usuario.css";
import Navbar from "../../components/NavBar";

const ModificarUsuario = () => {
    const { id_login } = useParams(); // Obtener el id_login de la URL
    const navigate = useNavigate();

    // Estados para gestionar los datos del usuario y de las empresas
    const [Usuario, setUsuario] = useState({
        id_login: '',
        nombre_completo: '',
        correo: '',
        contraseña: '',
        nombre_planta: ''
    });

    const [userData, setUserData] = useState({
        nombre_planta: '',
    });

    const [empresas, setEmpresas] = useState([]); // Para almacenar la lista de empresas

    // Cargar los datos del usuario por su id_login
    useEffect(() => {
        console.log("ID de usuario recibido:", id_login);

        const fetchUsuario = async () => {
            try {
                const response = await fetch(`http://localhost:3000/api/usuarioid?id_login=${id_login}`);
                if (!response.ok) throw new Error('Error al obtener los datos del usuario');

                const data = await response.json();
                console.log("Datos del usuario recibidos:", data);
                setUsuario(data);
            } catch (error) {
                console.error('Error al cargar los datos del usuario:', error);
            }
        };

        if (id_login) {
            fetchUsuario(); // Cargar datos si id_login está definido
        }
    }, [id_login]);

    // Cargar la lista de empresas para el select
    useEffect(() => {
        fetch('http://localhost:3000/api/centrodetrabajo')
            .then((response) => {
                if (!response.ok) throw new Error('Error al obtener los datos de planta');
                return response.json();
            })
            .then((data) => setEmpresas(data))
            .catch((error) => console.error('Error en la solicitud:', error));
    }, []);

    // Manejar los cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setUsuario({
            ...Usuario,
            [name]: value
        });
        setUserData({
            ...userData,
            [name]: value,
        });
    };

    // Manejar la acción del formulario para actualizar los datos del usuario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:3000/api/modificarusuario/${id_login}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Usuario), // Enviar datos actualizados
            });

            if (response.ok) {
                alert('Usuario modificado con éxito');
                navigate('/Usuarios'); // Redireccionar después de la modificación
            } else {
                alert('Error al modificar el usuario');
            }
        } catch (error) {
            console.error('Error al modificar el usuario:', error);
            alert('Error al modificar el usuario');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="cabecera-us">
                <h1 className="titulo-lav">Usuario seleccionado</h1>
            </div>
            <div className="mod-us-card card">
                <div className="formulario-mod">
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre usuario</label>
                        <input
                            type="text"
                            name="nombre_completo"
                            value={Usuario.nombre_completo}
                            onChange={handleChange}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>Correo</label>
                        <input
                            type="text"
                            name="correo"
                            value={Usuario.correo}
                            onChange={handleChange}
                            className="form-control"
                        />
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
                    </div>

                    <button type="submit" className="btn btn-primary btn-guard-camb">Guardar cambios</button>
                </form>
                </div>
            </div>
        </div>
    );
};

export default ModificarUsuario;

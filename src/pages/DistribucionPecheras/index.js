/**
 * Copyright (c) [2024] [Pilar Bonnault Mancilla, Nicolás González Espinoza y Christofer Ruiz Almonacid]
 * Licensed under the MIT License.
 * See LICENSE file in the root directory.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/distribucion-pecheras.css";
import Navbar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {  faTrash, faSync } from '@fortawesome/free-solid-svg-icons'
import swal from 'sweetalert';

const ActualizarPecheras = () => {
    const navigate = useNavigate();

    // Estado para almacenar la información de la pechera que se actualizará
    const [pechera, setPechera] = useState({
        id_planta: '', // Almacena el ID del centro de trabajo seleccionado
    });

    // Estado para almacenar las empresas disponibles
    const [empresas, setEmpresas] = useState([]);

    // Estado para almacenar los UIDs leídos desde el Arduino
    const [uidsLeidas, setUidsLeidas] = useState([]);

    // Estado para almacenar el último UID leído, para evitar duplicados
    const [lastUid, setLastUid] = useState('');

    // Hook que se ejecuta al montar el componente
    useEffect(() => {
        setUidsLeidas([]); // Inicializa la lista de UIDs leídos como vacía
        fetchEmpresas();   // Obtiene las empresas desde la API
    }, []);

    /**
     * Función para obtener la lista de empresas desde la API
     */
    const fetchEmpresas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/centrodetrabajo');
            if (!response.ok) {
                throw new Error('Error al obtener los datos de planta');
            }
            const data = await response.json();
            setEmpresas(data); // Actualiza el estado con las empresas obtenidas
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };

    /**
     * Función para obtener el UID más reciente desde el Arduino
     */
    const fetchUIDFromArduino = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/latest-uid');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Verifica si el UID obtenido es nuevo y lo añade a la lista
            if (data.uid && data.uid !== lastUid) {
                setLastUid(data.uid); // Actualiza el último UID leído
                if (!uidsLeidas.includes(data.uid)) {
                    setUidsLeidas(prevUids => [...prevUids, data.uid]); // Añade el UID si no existe en la lista
                }
            }
        } catch (error) {
            console.error('Error al obtener el UID:', error.message);
        }
    };

    // Hook para establecer un intervalo que consulta el UID cada segundo
    useEffect(() => {
        const intervalId = setInterval(fetchUIDFromArduino, 1000);
        return () => clearInterval(intervalId); // Limpia el intervalo al desmontar el componente
    }, [lastUid]);

    /**
     * Maneja los cambios en los inputs del formulario
     * @param {Object} e - Evento del cambio en el input
     */
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPechera({
            ...pechera,
            [name]: value, // Actualiza el estado con el valor seleccionado
        });
    };

    /**
     * Maneja el envío del formulario para actualizar las pecheras
     * @param {Object} e - Evento del envío del formulario
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Verifica que haya UIDs leídos y un centro de trabajo seleccionado
        if (uidsLeidas.length === 0 || !pechera.id_planta) {
            swal("Campos incompletos", "Por favor, asegúrate de que se hayan leído UIDs y selecciona un centro de trabajo.", "warning");
            return;
        }
    
        try {
            const bodyData = {
                id_pechera_registro: uidsLeidas, // Lista de UIDs leídos
                id_planta: pechera.id_planta,   // Centro de trabajo seleccionado
            };
    
            const response = await fetch('http://localhost:3000/api/modificarplantapechera', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData), // Envía los datos al servidor
            });
    
            if (response.ok) {
                swal({
                    title: "¡Éxito!",
                    text: "Pechera actualizada con éxito.",
                    icon: "success",
                    button: "Aceptar",
                }).then(() => {
                    setUidsLeidas([]); // Limpia la lista de UIDs leídos
                    navigate("/datopecheras"); // Redirige a la página principal
                });
            } else {
                const errorText = await response.text();
                swal("Error", `Error: ${errorText}`, "error");
            }
        } catch (error) {
            console.error('Error al actualizar la pechera:', error);
            swal("Error", "Hubo un problema al actualizar la pechera. Por favor, inténtalo nuevamente.", "error");
        }
    };

    /**
     * Maneja el borrado de todos los UIDs leídos
     */
    const handleDelete = () => {
        setUidsLeidas([]); // Reinicia la lista de UIDs
    };

    return (
        <div>
            <Navbar />
            <Sidebar />
            <button onClick={handleDelete} className="btn btn-danger" id='btn-eliminar-reg'><FontAwesomeIcon icon={faTrash} />Limpiar registro</button>
            <h2 className="tit-pech">Distribución</h2>   
            <div className="container" id="cont-reg-pe">
                <form className="formpech" onSubmit={handleSubmit}>
                    <div className="div-regpe">
                        <label className="label-regpe">Centro de Trabajo:</label>
                        <select className="input-regpe" name="id_planta" value={pechera.id_planta} onChange={handleChange} required>
                            <option value="">Selecciona un centro</option>
                            {empresas.map((empresa) => (
                                <option key={empresa.id_planta} value={empresa.id_planta}>
                                    {empresa.nombre_planta} {/* Mostrar nombre_planta */}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button id="btn-agregar" type="submit"><FontAwesomeIcon icon={faSync} />Actualizar Pecheras</button>
                </form>

                {/* Mostrar UIDs leídas */}
                <div className="uids-leidas">
                    <h3>UIDs Leídas:</h3>
                    <ul>
                        {uidsLeidas.map((uid, index) => (
                            <li key={index}>{index + 1}. {uid}</li> 
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ActualizarPecheras;

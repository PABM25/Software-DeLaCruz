import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/lavado.css';
import Navbar from '../../components/NavBar';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTint } from '@fortawesome/free-solid-svg-icons';
import swal from 'sweetalert';


const Lavado = () => {
    const [pecheras, setPecheras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uid, setUid] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // Para mostrar el mensaje de error

    // Función para obtener el UID más reciente
    const fetchLatestUID = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/latest-uid');
            if (!response.ok) {
                throw new Error('Error al obtener el UID más reciente');
            }
            const data = await response.json();
            return data.uid;
        } catch (error) {
            console.error('Error al obtener el UID:', error.message);
            return null;
        }
    };

    // Función para obtener los detalles de la pechera usando el UID
    const fetchPecheraDetails = async (uid) => {
        try {
            const response = await fetch(`http://localhost:3000/api/pecherasleer/${uid}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
    
            if (!data) {
                swal({
                    title: "Pechera no registrada",
                    text: "El UID ingresado no corresponde a una pechera registrada.",
                    icon: "warning",
                    button: "Aceptar",
                });
            } else {
                setErrorMessage(''); // Limpiar el mensaje de error
                // Evitar duplicados
                setPecheras((prevPecheras) => {
                    if (prevPecheras.some((pechera) => pechera.id_pechera_registro === data.id_pechera_registro)) {
                        return prevPecheras; // Si ya existe, no la agregamos
                    }
                    return [...prevPecheras, data];
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener los detalles de la pechera:', error.message);
            setLoading(false);
            swal({
                title: "Error",
                text: "Pechera no registrada",
                icon: "error",
                button: "Aceptar",
            });
        }
    };

    // Función para eliminar una pechera de la lista en pantalla
    const eliminarPechera = (id_pechera_registro) => {
        setPecheras((prevPecheras) => prevPecheras.filter((pechera) => pechera.id_pechera_registro !== id_pechera_registro));
    };

    // Función para manejar el registro del lavado
    const handleRegistrarLavado = async () => {
        try {
            const idsWithObservations = pecheras.map(pechera => ({
                id_pechera_registro: pechera.id_pechera_registro,
                Observaciones: pechera.Observaciones || '' // Capturar observaciones
            }));
    
            const response = await axios.post('http://localhost:3000/api/registrolavado', { ids: idsWithObservations });
    
            if (response.status === 200) {
                swal({
                    title: "¡Éxito!",
                    text: "El registro de lavado se completó con éxito.",
                    icon: "success",
                    button: "Aceptar",
                }).then(() => {
                    window.location.reload(); // Refrescar la página después de la confirmación
                });
            }
        } catch (error) {
            console.error('Error al registrar el lavado:', error);
            swal({
                title: "Error",
                text: "Ocurrió un problema al registrar el lavado. Intenta de nuevo.",
                icon: "error",
                button: "Aceptar",
            });
        }
    };

    useEffect(() => {
        const loadPecheraData = async () => {
            const latestUid = await fetchLatestUID();
            if (latestUid) {
                setUid(latestUid);
                await fetchPecheraDetails(latestUid);
            }
        };

        loadPecheraData();

        const interval = setInterval(async () => {
            const latestUid = await fetchLatestUID();
            if (latestUid && latestUid !== uid) {
                setUid(latestUid);
                await fetchPecheraDetails(latestUid);
            }
        }, 1000); // Verifica el UID cada 3 segundos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [uid]);

    return (
        <div>
            <Navbar />
            <div className='container' id='cabecera'>
                <h1>Lavado de pecheras</h1>
                <button className='reg_lav' onClick={handleRegistrarLavado}><FontAwesomeIcon icon={faTint} />Registrar lavado</button>
            </div>

            {errorMessage && (
                <div
                    className={`alert ${errorMessage === 'Registro de lavado exitoso' ? 'alert-success' : 'alert-danger'
                        }`}
                    role="alert"
                >
                    {errorMessage}
                </div>
            )}


            <div className='container'>
                {loading ? (
                    <p>Cargando datos de las pecheras...</p>
                ) : pecheras.length > 0 ? (
                    <table id='table'>
                        <thead>
                            <tr>
                                <th>ID pechera</th>
                                <th>Centro de trabajo</th>
                                <th>Lavados</th>
                                <th>Talla</th>
                                <th>Observación</th>
                                <th>Limpiar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pecheras.map((pechera) => (
                                <tr key={pechera.id_pechera_registro}>
                                    <td>{pechera.id_pechera_registro}</td>
                                    <td>{pechera.nombre_planta || 'N/A'}</td>
                                    <td>{pechera.Cantidad_Lavados}</td>
                                    <td>{pechera.Talla}</td>
                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={pechera.Observaciones || ''}
                                            onChange={(e) => {
                                                // Actualiza las observaciones en el estado
                                                const updatedPecheras = pecheras.map(p =>
                                                    p.id_pechera_registro === pechera.id_pechera_registro ? { ...p, Observaciones: e.target.value } : p
                                                );
                                                setPecheras(updatedPecheras);
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => eliminarPechera(pechera.id_pechera_registro)}
                                        >
                                            Limpiar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No se encontraron pecheras.</p>
                )}
            </div>
        </div>
    );
};

export default Lavado;

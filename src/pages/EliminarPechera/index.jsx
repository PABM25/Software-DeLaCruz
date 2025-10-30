import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../../styles/eliminar-pechera.css';
import Navbar from '../../components/NavBar';
import axios from 'axios'; 
import swal from 'sweetalert';

const EliminarPechera = () => {
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

    // Función para eliminar una pechera individual
    const eliminarPechera = async (id_pechera_registro) => {
        try {
            const response = await axios.delete(`http://localhost:3000/api/eliminarpechera/${id_pechera_registro}`);
            if (response.status === 200) {
                setPecheras((prevPecheras) =>
                    prevPecheras.filter(pechera => pechera.id_pechera_registro !== id_pechera_registro)
                );
                swal("Eliminada", "La pechera se eliminó correctamente", "success");
            } else {
                console.error('Error eliminando la pechera:', response.data.message);
                swal("Error", "No se pudo eliminar la pechera", "error");
            }
        } catch (error) {
            console.error('Error en la solicitud de eliminación:', error.message);
            swal("Error", "Hubo un problema al eliminar la pechera", "error");
        }
    };
    

    const eliminarTodasPecheras = async () => {
        if (pecheras.length === 0) {
            swal("Sin pecheras", "No hay pecheras para eliminar", "info");
            return;
        }
    
        const confirm = await swal({
            title: "¿Estás seguro?",
            text: "Esto eliminará todas las pecheras de la lista. Esta acción no puede deshacerse.",
            icon: "warning",
            buttons: ["Cancelar", "Eliminar"],
            dangerMode: true,
        });
    
        if (!confirm) return;
    
        const ids = pecheras.map(pechera => pechera.id_pechera_registro);
    
        try {
            const response = await axios.delete('http://localhost:3000/api/eliminarpecherasmulti', { data: { ids } });
            if (response.status === 200) {
                setPecheras([]); // Limpiar la lista en el frontend después de la eliminación
                swal("Eliminadas", "Todas las pecheras se eliminaron correctamente", "success");
            } else {
                swal("Error", "No se pudieron eliminar las pecheras", "error");
            }
        } catch (error) {
            console.error('Error al eliminar las pecheras:', error.message);
            swal("Error", "Hubo un problema al eliminar las pecheras", "error");
        }
    };
    
    const eliminarPecheravista = (id_pechera_registro) => {
        swal({
            title: "¿Estás seguro?",
            text: "Esto eliminará la pechera de la lista temporalmente.",
            icon: "warning",
            buttons: ["Cancelar", "Eliminar"],
            dangerMode: true,
        }).then((confirm) => {
            if (confirm) {
                setPecheras((prevPecheras) =>
                    prevPecheras.filter(pechera => pechera.id_pechera_registro !== id_pechera_registro)
                );
                swal("Eliminada", "La pechera fue eliminada de la vista.", "success");
            }
        });
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
                setErrorMessage('Pechera no registrada'); // Mostrar mensaje de error si no hay datos
                setTimeout(() => setErrorMessage(''), 3000); // Limpiar el mensaje después de 3 segundos
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
        }  catch (error) {
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
        }, 1000); // Verifica el UID cada 1 segundos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [uid]);

    return (
        <div>
            <Navbar />
            <div className='container' id='cabecera'>
                <h1>Escanea las pecheras que vas a eliminar</h1>
                <button className='reg_lav' onClick={eliminarTodasPecheras}>
                    Eliminar todas las pecheras
                </button>
            

                {errorMessage && (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )}

                <div className='card' id='card-eliminar'>
                    {loading ? (
                        <p>Cargando datos de las pecheras...</p>
                    ) : pecheras.length > 0 ? (
                        <table className='table'>
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
                                                    const updatedPecheras = pecheras.map(p => 
                                                        p.id_pechera_registro === pechera.id_pechera_registro ? { ...p, Observaciones: e.target.value } : p
                                                    );
                                                    setPecheras(updatedPecheras);
                                                }}
                                            />
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-warning"
                                                onClick={() => eliminarPecheravista(pechera.id_pechera_registro)}
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
        </div>
    );
};

export default EliminarPechera;

import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import '../../styles/info-pechera.css';
import Navbar from '../../components/NavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner } from '@fortawesome/free-solid-svg-icons';

const ModificarPecheras = () => {
    const navigate = useNavigate(); // Hook para redireccionar
    const [pechera, setPechera] = useState(null);
    const [loading, setLoading] = useState(true);
    const [plantas, setPlantas] = useState([]);
    const [fechasLavado, setFechasLavado] = useState([]);
    const [uid, setUid] = useState(null);
    const [id_planta, setIdPlanta] = useState(null); // Estado para id_planta
    const [message, setMessage] = useState(null); // Estado para el mensaje de actualización
    const [messageType, setMessageType] = useState(null); // Estado para el tipo de mensaje (success o error)
    const [isOpen, setIsOpen] = useState(false); // Estado para controlar si la lista está expandida o retraída

  const toggleList = () => {
    setIsOpen(!isOpen); // Cambia el estado de apertura/cierre
  };

    // Función para manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPechera((prevPechera) => ({
            ...prevPechera,
            [name]: value,
        }));
    };
     

    


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
    const fetchPecheraDetails = async (id_pechera_registro) => {
        try {
            const response = await fetch(`http://localhost:3000/api/pecheraid?id_pechera_registro=${id_pechera_registro}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data) {
                setPechera(data);
                console.log(data);  // Verificar los datos obtenidos
                setPechera(data);
            } else {
                console.log('No se encontraron datos de la pechera');
                setPechera(null);
            }
            setLoading(false);

        } catch (error) {
            console.error('Error al obtener los detalles de la pechera:', error.message);
            setLoading(false);
        }

    };
    const fetchlavados = async (id_pechera_registro) => {
        try {
            const response = await fetch(`http://localhost:3000/api/pecheraidlavado?id_pechera_registro=${id_pechera_registro}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Datos recibidos del backend:', data); // <-- Verifica qué devuelve el backend
    
            if (Array.isArray(data)) {
                setFechasLavado(data);
            } else if (data && data.Fecha_lavado) {
                setFechasLavado([data]); // Transforma un objeto en un arreglo
            } else {
                setFechasLavado([]);
            }
        } catch (error) {
            console.error('Error al obtener los detalles de los lavados:', error.message);
            setFechasLavado([]);
        }
    };
    
    
    // Función para obtener los nombres de las plantas
    const fetchPlantas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/centrodetrabajo');
            if (!response.ok) {
                throw new Error('Error al obtener los lavados');
            }
            const data = await response.json();
            console.log(data); // Agregar esta línea para verificar la respuesta
            setPlantas(data);
        } catch (error) {
            console.error('Error al obtener las plantas:', error.message);
        }
    };
    
    
    useEffect(() => {
        const loadPecheraData = async () => {
            await fetchPlantas();
            const latestUid = await fetchLatestUID();
            if (latestUid) {
                setUid(latestUid);
                await fetchPecheraDetails(latestUid);
                await fetchlavados(latestUid);
            }
        };


        const interval = setInterval(async () => {
            const latestUid = await fetchLatestUID();
            if (latestUid && latestUid !== uid) {
                setUid(latestUid);
                await fetchPecheraDetails(latestUid);
                await fetchlavados(latestUid);
            }
        }, 500); // Verifica el UID cada 3 segundos

        return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
    }, [uid]);

    return (
        <div>
            <Navbar />
            <div className="container">
                <h1 id="tit-mod-lec">Información de pechera</h1>
                {message && (
                    <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                        {message}
                    </div>
                )}
                <div className='container' id="tarj-mod-pech-lec">
                    {loading ? (
                        <p>Cargando datos de la pechera...</p>
                    ) : pechera ? (
                        <form >
                            <div className="form-group">
                                
                                <p className="FECHA_REGISTRO">Fecha de fabricación: {new Date(pechera.fecha_registro).toLocaleDateString()}</p>
                            </div>

                            <div className="form-group">
                                <label>UID pechera:</label>
                                <input type="text" value={pechera.id_pechera_registro} disabled className='form-control' />
                            </div>

                            
                            <div className="form-group">
                                <label>Talla:</label>
                                <input
                                    type="text"
                                    name="Talla"
                                    value={pechera.Talla}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Cantidad de lavados:</label>
                                <input
                                    type="number"
                                    name="Cantidad_Lavados"
                                    value={pechera.Cantidad_Lavados || ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                            <div className="form-group">
                                <label>Fechas de los lavados de la pechera:</label>
                                <div className="accordion" id="accordionFechas">
                                    <div className="accordion-item">
                                        <h2 className="accordion-header" id="headingFechas">
                                            <button
                                                className="accordion-button"
                                                type="button"
                                                onClick={toggleList} // Cambia el estado al hacer clic
                                                aria-expanded={isOpen ? "true" : "false"}
                                                aria-controls="collapseFechas"
                                            >
                                                Ver fechas de los lavados 
                                            </button>
                                        </h2>
                                        {isOpen && (
                                            <div
                                                id="collapseFechas"
                                                className="accordion-collapse collapse show"
                                                aria-labelledby="headingFechas"
                                            >
                                                <div className="accordion-body">
                                                    <ul>
                                                        {fechasLavado.map((lavado, index) => (
                                                            <li key={index}>
                                                                {index + 1}º lavado con fecha el  {new Date(lavado.Fecha_lavado).toLocaleDateString()}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            





                            <div className="form-group">
                                <label>Centro de trabajo:</label>
                                <input
                                    type="text"
                                    name="nombre_planta"
                                    value={pechera.nombre_planta || ''}
                                    onChange={handleChange}
                                    className="form-control"
                                    disabled
                                />
                            </div>

                        </form>
                    ) : (
                        <p>No se encontró la pechera.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModificarPecheras;

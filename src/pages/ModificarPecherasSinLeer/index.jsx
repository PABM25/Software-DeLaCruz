
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import '../../styles/modificar-pecheras.css';
import Navbar from '../../components/NavBar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner } from '@fortawesome/free-solid-svg-icons';


const ModificarPecheraSinleer = () => {
    const navigate = useNavigate();
    const { id_pechera_registro } = useParams(); // Obtener el UID del URL
    const [pechera, setPechera] = useState(null);
    const [loading, setLoading] = useState(true);
    const [plantas, setPlantas] = useState([]);
    const [message, setMessage] = useState(null);
    const [messageType, setMessageType] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPechera((prevPechera) => ({
            ...prevPechera,
            [name]: value,
        }));
    };

    const handleModify = async (e) => {
        e.preventDefault();
        const { id_planta, Cantidad_Lavados, Talla, Parametros, Observaciones, Índice_Microbiológico } = pechera;

        try {
            const response = await fetch(`http://localhost:3000/api/modificarpecheras/${pechera.id_pechera_registro}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_planta, Cantidad_Lavados, Talla, Parametros, Observaciones, Índice_Microbiológico }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(data.message);
                setMessageType('success');
                setTimeout(() => {
                    navigate('/datopecheras');
                }, 2000);
            } else {
                const errorData = await response.json();
                setMessage(`Error: ${errorData.error || 'Error desconocido'}`);
                setMessageType('error');
            }
        } catch (error) {
            console.error('Error al modificar la pechera:', error);
            setMessage('Error al modificar la pechera');
            setMessageType('error');
        }
    };

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

    const fetchPlantas = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/centrodetrabajo');
            if (!response.ok) {
                throw new Error('Error al obtener las plantas');
            }
            const data = await response.json();
            setPlantas(data);
        } catch (error) {
            console.error('Error al obtener las plantas:', error.message);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            await fetchPlantas();
            await fetchPecheraDetails(id_pechera_registro); // Usar el UID del URL
        };

        loadData();
    }, [id_pechera_registro]);

    return (
        <div >
            <Navbar />
            <div className='container' id="tarj-mod-pech">
                <h1 className='titulo-modi'>Modificar pechera</h1>
                <div className="container" id="modi-pech-s"> 
                    {message && (
                        <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'}`} role="alert">
                            {message}
                        </div>
                    )}
                
                    {loading ? (
                        <p>Cargando datos de la pechera...</p>
                    ) : pechera ? (
                        <form onSubmit={handleModify}>
                            <div className="form-group">
                                <label>UID pechera:</label>
                                <input type="text" value={pechera.id_pechera_registro} disabled className='form-control' />
                            </div>

                            <div className="form-group">
                                <label>Fecha fabricación</label>
                                <p>Fecha de fabricación: {new Date(pechera.fecha_registro).toLocaleDateString()}</p>
                            </div>

                            <div className="form-group">
                                <label>Talla:</label>
                                <select
                                    className="input-regpe"
                                    name="Talla"
                                    value={pechera.Talla || ''}
                                    onChange={handleChange}
                                >
                                    <option value="X-S">X-S</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="X-L">X-L</option>
                                </select>
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
                                <label>Observaciones:</label>
                                <input
                                    type="text"
                                    name="Observaciones"
                                    value={pechera.Observaciones || ''}
                                    onChange={handleChange}
                                    className="observacion form-control"
                                />
                            </div>
                            <label>Centro de trabajo:</label>
                            <select
                                value={pechera.id_planta || ""}
                                onChange={(e) => setPechera((prev) => ({ ...prev, id_planta: e.target.value === "" ? null : e.target.value }))}
                            >
                                <option value=""> {pechera.nombre_planta}</option>
                                {plantas.map((planta) => (
                                    <option key={planta.id_planta} value={planta.id_planta}>
                                        {planta.nombre_planta}
                                    </option>
                                ))}
                            </select>

                            <div className="form-group">
                                <label>Índice Microbiológico:</label>
                                <select
                                    className="input-regpe"
                                    name="Índice_Microbiológico"
                                    value={pechera.Índice_Microbiológico || ''}
                                    onChange={handleChange}
                                >
                                    <option value="SI">SI</option>
                                    <option value="No">No</option>

                                </select>
                            </div>

                            

                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin /> Modificando...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faEdit} /> Modificar pechera
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <p>No se encontró la pechera.</p>
                    )}
                </div>   
            </div>
        </div>
    );
};

export default ModificarPecheraSinleer;

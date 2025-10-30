import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/registro-pecheras.css";
import Navbar from "../../components/NavBar";
import Sidebar from "../../components/SideBar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2'; // Importamos SweetAlert2
//import 'sweetalert2/src/sweetalert2.scss'; // Estilo predeterminado
import 'sweetalert2/dist/sweetalert2.min.css';


const RegistroPecheras = () => {
    const navigate = useNavigate();
    const [pechera, setPechera] = useState({
        talla: '',
        id_planta: ''
    });

    const [uidsLeidas, setUidsLeidas] = useState([]);
    const [lastUid, setLastUid] = useState('');
    const [empresas, setEmpresas] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setUidsLeidas([]);
        setLastUid('');
    }, []);

    // Efecto para obtener UIDs desde Arduino
    const fetchUIDFromArduino = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/latest-uid');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.uid && data.uid !== lastUid) {
                setLastUid(data.uid);
                // Asegurarse de que no se duplique el UID
                if (!uidsLeidas.includes(data.uid)) {
                    setUidsLeidas(prevUids => [...prevUids, data.uid]);
                }
            }
        } catch (error) {
            console.error('Error al obtener el UID:', error.message);
        }
    };

    // Intervalo para obtener UIDs
    useEffect(() => {
        const intervalId = setInterval(fetchUIDFromArduino, 1000);
        return () => clearInterval(intervalId);
    }, [lastUid, uidsLeidas]);

    // Efecto para obtener empresas
    useEffect(() => {
        const fetchEmpresas = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/centrodetrabajo');
                if (!response.ok) throw new Error('Error al obtener los datos de planta');
                const data = await response.json();
                setEmpresas(data);
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };
        fetchEmpresas();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPechera({
            ...pechera,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uidsLeidas.length === 0 || !pechera.talla) {
            Swal.fire({
                title: 'Faltan datos',
                text: 'Por favor, asegúrate de que se hayan leído UIDs y seleccionado una talla.',
                icon: 'warning',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        // Eliminar duplicados de uidsLeidas
        const uniqueUids = [...new Set(uidsLeidas)];

        const bodyData = {
            uids: uniqueUids,
            talla: pechera.talla,
        };

        if (pechera.id_planta) {
            bodyData.id_planta = pechera.id_planta;
        }

        // Enviar los datos a la API
        try {
            const response = await fetch('http://localhost:3000/api/registropecheras', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });

            if (response.ok) {
                Swal.fire({
                    title: '¡Registro Exitoso!',
                    text: 'Las pecheras han sido registradas correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
                setPechera({ talla: '', id_planta: '' });
                setUidsLeidas([]);
                navigate("/datopecheras");
            } else {
                const errorText = await response.text();
                Swal.fire({
                    title: 'Error',
                    text: `Error: ${errorText}`,
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        } catch (error) {
            console.error('Error al registrar las pecheras:', error);
            Swal.fire({
                title: 'Error',
                text: 'Error al registrar las pecheras. Por favor, intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const handleDelete = () => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "Se eliminarán todos los registros leídos.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, limpiar',
            cancelButtonText: 'Cancelar',
        }).then((result) => {
            if (result.isConfirmed) {
                setUidsLeidas([]);
                Swal.fire(
                    '¡Eliminados!',
                    'Los registros han sido limpiados.',
                    'success'
                );
            }
        });
    };

    return (
        <div>
            <Navbar />
            <Sidebar />
            <button onClick={handleDelete} className="btn btn-danger" id='btn-limpiar-reg'>
                <FontAwesomeIcon icon={faTrash} /> Limpiar Registros
            </button>
            <h2 className="tit-pech">Ingreso nuevas pecheras</h2>

            <div className="container" id="cont-reg-pe">
                <form className="formpech" onSubmit={handleSubmit}>
                    <div className="div-regpe">
                        <label className="label-regpe">Talla:</label>
                        <select className="input-regpe" name="talla" value={pechera.talla} onChange={handleChange} required>
                            <option value="">Selecciona una talla</option>
                            <option value="X-S">X-S</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="X-L">X-L</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label-regpe">Centro de trabajo (opcional):</label>
                        <select className="form-select" name="id_planta" value={pechera.id_planta} onChange={handleChange}>
                            <option value="">Selecciona un centro</option>
                            {empresas.map((empresa) => (
                                <option key={empresa.id_planta} value={empresa.id_planta}>
                                    {empresa.nombre_planta}
                                </option>
                            ))}
                        </select>
                        {errors.id_planta && <p className="text-danger">{errors.id_planta}</p>}
                    </div>

                    <button id="btn-agregar" type="submit" >
                        <FontAwesomeIcon icon={faPlus} /> Agregar Pecheras
                    </button>
                </form>

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

export default RegistroPecheras;
